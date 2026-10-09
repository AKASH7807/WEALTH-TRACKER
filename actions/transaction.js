"use server";

import {auth} from "@clerk/nextjs/server";
import {checkUser} from "@/lib/checkUser";
import {db, runDbTransaction} from "@/lib/prisma";
import {defaultCategories} from "@/data/categories";
import {revalidatePath} from "next/cache";
import {GoogleGenerativeAI} from "@google/generative-ai";
import aj from "@/lib/arcjet";
import {request} from "@arcjet/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => {
    if (!obj) return obj;
    const num = obj.amount;
    return {
        ...obj,
        amount: typeof num === "number" ? num : (num?.toNumber ? num.toNumber() : Number(num || 0))
    };
};

// Create Transaction
export async function createTransaction(data) {
    try {
        const {userId} = await auth();
        if (!userId) 
            throw new Error("Unauthorized");

        // Get request data for ArcJet
        const req = await request();

        // Check rate limit
        const decision = await aj.protect(req, {
            userId,
            requested: 1, // Specify how many tokens to consume
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const {remaining, reset} = decision.reason;
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset
                    }
                });

                throw new Error("Too many requests. Please try again later.");
            }

            throw new Error("Request blocked");
        }

        const user = await checkUser();
        if (!user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id
            }
        });

        if (!account) {
            throw new Error("Account not found");
        }

        const currentBalance = typeof account.balance === "number" ? account.balance : (account.balance?.toNumber ? account.balance.toNumber() : Number(account.balance || 0));
        const txAmount = parseFloat(data.amount);
        if (isNaN(txAmount)) throw new Error("Invalid transaction amount");

        // Calculate new balance
        const balanceChange = data.type === "EXPENSE" ? -txAmount : txAmount;
        const newBalance = currentBalance + balanceChange;

        // Create transaction and update account balance
        const transaction = await runDbTransaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    amount: txAmount,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null
                }
            });

            await tx.account.update({
                where: {
                    id: data.accountId
                },
                data: {
                    balance: newBalance
                }
            });

            return newTransaction;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);

        return {success: true, data: serializeAmount(transaction)};
    } catch (error) {
        throw new Error(error.message);
    }
}

// get Transaction Data
export async function getTransaction(id) {
    const user = await checkUser();
    if (!user) 
        throw new Error("User not found");

    const transaction = await db.transaction.findUnique({
        where: {
            id,
            userId: user.id
        }
    });

    if (!transaction) 
        throw new Error("Transaction not found");

    return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
    try {
        const user = await checkUser();
        if (!user) 
            throw new Error("User not found");

        // Get original transaction to calculate balance change
        const originalTransaction = await db.transaction.findUnique({
            where: {
                id,
                userId: user.id
            },
            include: {
                account: true
            }
        });

        if (!originalTransaction) 
            throw new Error("Transaction not found");

        // Calculate balance changes
        const origAmount = typeof originalTransaction.amount === "number" ? originalTransaction.amount : (originalTransaction.amount?.toNumber ? originalTransaction.amount.toNumber() : Number(originalTransaction.amount || 0));
        const newAmount = parseFloat(data.amount);
        if (isNaN(newAmount)) throw new Error("Invalid transaction amount");

        const oldBalanceChange = originalTransaction.type === "EXPENSE" ? -origAmount : origAmount;
        const newBalanceChange = data.type === "EXPENSE" ? -newAmount : newAmount;
        const netBalanceChange = newBalanceChange - oldBalanceChange;

        // Update transaction and account balance in a transaction
        const transaction = await runDbTransaction(async (tx) => {
            const updated = await tx.transaction.update({
                where: {
                    id,
                    userId: user.id
                },
                data: {
                    ...data,
                    amount: newAmount,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null
                }
            });

            // Update account balance
            await tx.account.update({
                where: {
                    id: data.accountId
                },
                data: {
                    balance: {
                        increment: netBalanceChange
                    }
                }
            });

            return updated;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${data.accountId}`);

        return {success: true, data: serializeAmount(transaction)};
    } catch (error) {
        throw new Error(error.message);
    }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
    try {
        const user = await checkUser();
        if (!user) {
            throw new Error("User not found");
        }

        const [transactions, customCategories] = await Promise.all([
            db.transaction.findMany({
                where: {
                    userId: user.id,
                    ...query
                },
                include: {
                    account: true
                },
                orderBy: {
                    date: "desc"
                }
            }),
            db.category.findMany({
                where: { userId: user.id },
            }),
        ]);

        const catMap = new Map();
        defaultCategories.forEach((c) => {
            catMap.set(c.id, { name: c.name, color: c.color, icon: c.icon });
        });
        customCategories.forEach((c) => {
            catMap.set(c.id, {
                name: c.name,
                color: c.color || "#6366f1",
                icon: c.icon || "Tag",
            });
        });

        const enriched = transactions.map((t) => {
            const serialized = serializeAmount(t);
            const catInfo = catMap.get(t.category);
            return {
                ...serialized,
                categoryName: catInfo ? catInfo.name : (t.category ? t.category.replace(/-/g, " ") : ""),
                categoryColor: catInfo ? catInfo.color : "#6366f1",
                categoryIcon: catInfo ? catInfo.icon : "Tag",
            };
        });

        return {success: true, data: enriched};
    } catch (error) {
        throw new Error(error.message);
    }
}

// Scan Receipt with automatic fallback and retry
export async function scanReceipt(input) {
    try {
        let file = input;
        if (input instanceof FormData) {
            file = input.get("file");
        }

        if (!file) {
            throw new Error("No receipt file provided for scanning.");
        }

        // Convert file/blob to base64
        let base64String = "";
        let mimeType = "image/jpeg";

        if (typeof file === "string" && file.startsWith("data:")) {
            const parts = file.split(",");
            const match = parts[0].match(/:(.*?);/);
            if (match) mimeType = match[1];
            base64String = parts[1] || "";
        } else if (file.arrayBuffer) {
            const arrayBuffer = await file.arrayBuffer();
            base64String = Buffer.from(arrayBuffer).toString("base64");
            if (file.type && file.type.startsWith("image/")) {
                mimeType = file.type;
            }
        } else if (file.data) {
            base64String = file.data;
            if (file.mimeType) mimeType = file.mimeType;
        } else {
            throw new Error("Unsupported file format provided for scanning.");
        }

        // Clean base64 string
        base64String = base64String.replace(/[\r\n\s]/g, "");

        // Candidate Gemini models with active API support
        const envModel = process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL.replace(/^models\//, "") : null;
        const candidateModels = [
            envModel,
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-flash-latest"
        ].filter(Boolean);

        // Deduplicate candidates preserving priority
        const modelsToTry = Array.from(new Set(candidateModels));

        const prompt = `You are a high-accuracy OCR assistant for financial receipts and bills.
Examine this receipt image carefully and extract:
1. Total amount (just the final amount paid as a positive number)
2. Transaction date (format as YYYY-MM-DD or standard ISO date)
3. Description or items summary (concise summary of what was purchased)
4. Merchant or store name
5. Suggested category strictly from this list:
   [housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense]

Respond ONLY with a JSON object in this format:
{
  "amount": number or null,
  "date": "YYYY-MM-DD" or null,
  "description": "string" or null,
  "merchantName": "string" or null,
  "category": "string" or null
}`;

        let lastError = null;

        for (const modelName of modelsToTry) {
            // Up to 2 attempts per candidate (handles temporary 503 high-demand spikes)
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            responseMimeType: "application/json",
                            temperature: 0.1,
                        },
                    });

                    const result = await model.generateContent([
                        {
                            inlineData: {
                                data: base64String,
                                mimeType: mimeType,
                            },
                        },
                        prompt,
                    ]);

                    const response = await result.response;
                    const text = response.text()?.trim();
                    if (!text) throw new Error("Empty response from AI model");

                    // Flexible JSON parsing (direct or regex extraction)
                    let data = null;
                    try {
                        data = JSON.parse(text);
                    } catch {
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            data = JSON.parse(jsonMatch[0]);
                        }
                    }

                    if (data) {
                        // Extract and validate amount
                        let rawAmount = data.amount ?? data.total ?? data.totalAmount;
                        let amount = null;
                        if (rawAmount !== null && rawAmount !== undefined) {
                            const cleanedAmount = String(rawAmount).replace(/[^0-9.]/g, "");
                            const parsedAmount = parseFloat(cleanedAmount);
                            if (!isNaN(parsedAmount) && parsedAmount > 0) {
                                amount = parsedAmount;
                            }
                        }

                        // Extract and validate date
                        let date = null;
                        if (data.date) {
                            const parsedDate = new Date(data.date);
                            if (!isNaN(parsedDate.getTime())) {
                                date = parsedDate;
                            }
                        }

                        // Extract and normalize category
                        let category = data.category ? String(data.category).toLowerCase().trim() : null;
                        const validCategories = [
                            "housing", "transportation", "groceries", "utilities", "entertainment",
                            "food", "shopping", "healthcare", "education", "personal", "travel",
                            "insurance", "gifts", "bills", "other-expense"
                        ];
                        if (category && !validCategories.includes(category)) {
                            const match = validCategories.find(c => category.includes(c) || c.includes(category));
                            category = match || "other-expense";
                        }

                        const merchant = data.merchantName || data.merchant || null;
                        const description = data.description || merchant || "Receipt Purchase";

                        return {
                            amount,
                            date,
                            description,
                            category: category || "other-expense",
                            merchantName: merchant,
                        };
                    }
                } catch (error) {
                    lastError = error;
                    console.warn(`[OCR] Model ${modelName} (attempt ${attempt}) error:`, error?.message || error);
                    // On 503 spike, wait briefly before retry
                    if (attempt === 1 && (error?.message?.includes("503") || error?.message?.includes("high demand") || error?.message?.includes("429"))) {
                        await new Promise((resolve) => setTimeout(resolve, 800));
                    } else {
                        break; // move to next candidate model
                    }
                }
            }
        }

        // Try Vision OCR fallback if enabled in env
        if (process.env.USE_VISION_OCR === "true") {
            try {
                const ocrResult = await ocrWithVision(base64String, mimeType);
                if (ocrResult) return ocrResult;
            } catch (visionErr) {
                console.error("Vision OCR fallback failed:", visionErr);
            }
        }

        console.error("All OCR attempts failed. Last error:", lastError?.message || lastError);
        throw new Error("Could not extract receipt data clearly. Please check lighting, orientation, or try retrying.");
    } catch (error) {
        throw new Error(error.message || "Failed to scan receipt");
    }
}

// Attempt Google Cloud Vision OCR (dynamic import). Returns parsed object or null.
async function ocrWithVision(base64Image, mimeType) {
    try {
        // Dynamic import to keep dependency optional
        const {ImageAnnotatorClient} = await import('@google-cloud/vision');
        const client = new ImageAnnotatorClient();

        const request = {
            image: {content: base64Image},
        };

        const [result] = await client.textDetection(request);
        const detections = result?.textAnnotations;
        if (!detections || detections.length === 0) return null;

        const fullText = detections[0].description || '';
        const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        // Heuristics: merchant = first line, amount = largest currency-like number, date = first date-like token
        const merchantName = lines[0] || null;

        // Find numbers that look like totals
        const numberRegex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g;
        const currencyCandidates = [];
        for (const line of lines) {
            const matches = line.match(numberRegex);
            if (matches) {
                for (const m of matches) {
                    const normalized = m.replace(/[,]/g, '').replace(/\.(?=\d{2}$)/, '.').replace(/,(?=\d{2}$)/, '.');
                    const v = parseFloat(normalized);
                    if (!isNaN(v)) currencyCandidates.push(v);
                }
            }
        }

        const amount = currencyCandidates.length ? Math.max(...currencyCandidates) : null;

        // Date extraction (common formats)
        const dateRegex = /(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2})|(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/;
        let date = null;
        for (const line of lines) {
            const m = line.match(dateRegex);
            if (m) {
                const raw = m[0];
                const parsed = new Date(raw);
                if (!isNaN(parsed.getTime())) {
                    date = parsed;
                    break;
                }
            }
        }

        // Simple category mapping by keywords
        const textLower = fullText.toLowerCase();
        const categoryMap = {
            groceries: ['grocery', 'supermarket', 'mart', 'grocer'],
            food: ['cafe', 'restaurant', 'coffee', 'diner', 'pizza'],
            transport: ['uber', 'lyft', 'taxi', 'bus', 'metro', 'train', 'petrol', 'gas'],
            entertainment: ['cinema', 'movie', 'theatre', 'concert'],
            healthcare: ['pharmacy', 'clinic', 'hospital', 'doctor'],
            shopping: ['store', 'shop', 'mall', 'boutique'],
            utilities: ['electricity', 'water', 'internet', 'utility'],
            bills: ['invoice', 'bill'],
        };

        let category = 'other-expense';
        for (const [cat, keywords] of Object.entries(categoryMap)) {
            if (keywords.some(k => textLower.includes(k))) {
                category = cat;
                break;
            }
        }

        return {
            amount: amount,
            date: date,
            description: lines.slice(1, 5).join(' '),
            category,
            merchantName,
        };
    } catch (err) {
        // If the import fails or client can't run, bubble up
        throw err;
    }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
    const date = new Date(startDate);

    switch (interval) {
        case "DAILY": date.setDate(date.getDate() + 1);
            break;
        case "WEEKLY": date.setDate(date.getDate() + 7);
            break;
        case "MONTHLY": date.setMonth(date.getMonth() + 1);
            break;
        case "YEARLY": date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return date;
}

// Get previously used transaction description notes for suggestions
export async function getUserDescriptionSuggestions() {
    try {
        const user = await checkUser();
        if (!user) return { success: false, data: [] };

        const transactions = await db.transaction.findMany({
            where: {
                userId: user.id,
                description: { not: null },
            },
            select: {
                description: true,
                category: true,
                type: true,
                amount: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 200,
        });

        const frequencyMap = new Map();
        for (const tx of transactions) {
            const desc = tx.description?.trim();
            if (!desc) continue;
            const key = desc.toLowerCase();
            if (!frequencyMap.has(key)) {
                frequencyMap.set(key, {
                    description: desc,
                    category: tx.category,
                    type: tx.type,
                    count: 1,
                    lastUsed: tx.createdAt,
                });
            } else {
                const item = frequencyMap.get(key);
                item.count += 1;
            }
        }

        const suggestions = Array.from(frequencyMap.values()).sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return new Date(b.lastUsed) - new Date(a.lastUsed);
        });

        return { success: true, data: suggestions };
    } catch (error) {
        console.error("getUserDescriptionSuggestions error:", error);
        return { success: false, data: [] };
    }
}
