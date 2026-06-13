"use server";

import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/prisma";
import {revalidatePath} from "next/cache";
import {GoogleGenerativeAI} from "@google/generative-ai";
import aj from "@/lib/arcjet";
import {request} from "@arcjet/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber()
});

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

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });

        if (! user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id
            }
        });

        if (! account) {
            throw new Error("Account not found");
        }

        // Create transaction (balance is calculated from all transactions, not stored)
        const transaction = await db.transaction.create({
            data: {
                ... data,
                userId: user.id,
                nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null
            }
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${
            transaction.accountId
        }`);

        return {success: true, data: serializeAmount(transaction)};
    } catch (error) {
        throw new Error(error.message);
    }
}

// get Transaction Data
export async function getTransaction(id) {
    const {userId} = await auth();
    if (!userId) 
        throw new Error("Unauthorized");
    


    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        }
    });

    if (! user) 
        throw new Error("User not found");
    


    const transaction = await db.transaction.findUnique({
        where: {
            id,
            userId: user.id
        }
    });

    if (! transaction) 
        throw new Error("Transaction not found");
    


    return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
    try {
        const {userId} = await auth();
        if (!userId) 
            throw new Error("Unauthorized");
        


        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });

        if (! user) 
            throw new Error("User not found");
        


        // Get original transaction to verify it exists
        const originalTransaction = await db.transaction.findUnique({
            where: {
                id,
                userId: user.id
            },
            include: {
                account: true
            }
        });

        if (! originalTransaction) 
            throw new Error("Transaction not found");
        

        // Update transaction (balance is calculated from all transactions, not stored)
        const transaction = await db.transaction.update({
            where: {
                id,
                userId: user.id
            },
            data: {
                ... data,
                nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null
            }
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${
            data.accountId
        }`);

        return {success: true, data: serializeAmount(transaction)};
    } catch (error) {
        throw new Error(error.message);
    }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
    try {
        const {userId} = await auth();
        if (!userId) 
            throw new Error("Unauthorized");
        


        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });

        if (! user) {
            throw new Error("User not found");
        }

        const transactions = await db.transaction.findMany({
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
        });

        return {success: true, data: transactions};
    } catch (error) {
        throw new Error(error.message);
    }
}

// Scan Receipt
export async function scanReceipt(file) {
    // Try a set of candidate models (can be overridden with GEMINI_MODEL env var)
    const modelsToTry = [process.env.GEMINI_MODEL, "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"].filter(Boolean);

    // Convert File to ArrayBuffer once
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({model: modelName});
            const result = await model.generateContent([{inlineData: {data: base64String, mimeType: file.type}}, prompt]);
            const response = await result.response;
            const text = response.text();
            const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

            try {
                const data = JSON.parse(cleanedText);
                return {
                    amount: isNaN(parseFloat(data.amount)) ? null : parseFloat(data.amount),
                    date: data.date ? new Date(data.date) : null,
                    description: data.description || null,
                    category: data.category || null,
                    merchantName: data.merchantName || null
                };
            } catch (parseError) {
                console.error(`Parsing failure from model ${modelName}:`, parseError);
                lastError = parseError;
                // try next model
            }
        } catch (error) {
            console.error(`Model ${modelName} failed:`, error && error.message ? error.message : error);
            lastError = error;
            // If model not found (404) try next candidate, otherwise continue
            continue;
        }
    }

    // If none succeeded, try a Vision OCR fallback (only if configured)
    console.error("All receipt scanning models failed", lastError);

    // Try Google Cloud Vision OCR if available and enabled via env
    if (process.env.USE_VISION_OCR === "true") {
        try {
            const ocrResult = await ocrWithVision(base64String, file.type);
            if (ocrResult) return ocrResult;
        } catch (visionErr) {
            console.error("Vision OCR fallback failed:", visionErr);
        }
    }

    throw new Error("Receipt scanning failed. Check server logs or configure GEMINI_MODEL or enable USE_VISION_OCR.");
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
