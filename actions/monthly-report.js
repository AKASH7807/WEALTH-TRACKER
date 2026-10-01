"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { generateMonthlyReportPdf } from "@/lib/pdf-report";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Calculates start and end timestamps for a target month.
 * monthOffset = 1 means previous calendar month (default for month-end reports).
 * monthOffset = 0 means current calendar month to-date.
 */
function getReportDateRange(monthOffset = 1) {
  const date = new Date();
  date.setDate(1); // Set to 1st to avoid end-of-month overflow bugs
  date.setMonth(date.getMonth() - monthOffset);

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  const startDate = new Date(year, month, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const monthName = date.toLocaleString("default", { month: "long" });

  return { startDate, endDate, monthName, year };
}

/**
 * Generates financial insights using Gemini AI with fallback defaults.
 */
async function generateFinancialInsights(stats, monthLabel) {
  if (stats.totalIncome === 0 && stats.totalExpenses === 0) {
    return [
      "No transactions recorded for this billing cycle yet.",
      "Add income or log your daily expenses to unlock personalized AI insights.",
      "Establish budgets for categories like Food, Utilities, and Shopping to track financial health.",
    ];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return [
      "Track your expenses closely to identify saving opportunities.",
      "Consider categorizing recurring expenses to optimize monthly budgets.",
      "Review your net cash flow to steadily increase your emergency fund.",
    ];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this financial data and provide 3 concise, actionable insights.
      Focus on spending patterns, high expenses, and practical wealth-building advice.
      Keep it friendly, professional, and concise.

      Financial Data for ${monthLabel}:
      - Total Income: ₹${stats.totalIncome}
      - Total Expenses: ₹${stats.totalExpenses}
      - Net Savings: ₹${stats.totalIncome - stats.totalExpenses}
      - Expense Categories: ${Object.entries(stats.byCategory)
        .map(([category, amount]) => `${category}: ₹${amount}`)
        .join(", ")}

      Format the response as a raw JSON array of 3 strings, like this:
      ["insight 1", "insight 2", "insight 3"]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights with Gemini:", error);
    return [
      "Your highest expense category this month might need closer monitoring.",
      "Consider setting category budget thresholds to avoid overspending.",
      "Maintaining a healthy savings rate above 20% accelerates your financial goals.",
    ];
  }
}

/**
 * Fetches transactions and computes key aggregates for a user and date range.
 */
async function getMonthlyStatsAndTransactions(userId, startDate, endDate) {
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      account: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const stats = transactions.reduce(
    (acc, t) => {
      const amount =
        typeof t.amount === "number"
          ? t.amount
          : (t.amount?.toNumber?.() || Number(t.amount) || 0);

      if (t.type === "EXPENSE") {
        acc.totalExpenses += amount;
        acc.byCategory[t.category] =
          (acc.byCategory[t.category] || 0) + amount;
      } else {
        acc.totalIncome += amount;
      }
      return acc;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );

  return { stats, transactions };
}

/**
 * Server action to generate and send the user's monthly report email with PDF attachment.
 */
export async function sendMonthlyReportEmail({ monthOffset = 1 } = {}) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized: Please sign in to request a report");
    }

    const { startDate, endDate, monthName, year } = getReportDateRange(monthOffset);
    const { stats, transactions } = await getMonthlyStatsAndTransactions(
      user.id,
      startDate,
      endDate
    );

    const monthLabel = `${monthName} ${year}`;
    const insights = await generateFinancialInsights(stats, monthLabel);

    // Generate Executive PDF Buffer
    const pdfBuffer = await generateMonthlyReportPdf({
      userName: user.name,
      userEmail: user.email,
      monthName,
      year,
      stats,
      transactions,
    });

    const filename = `Wealth-Statement-${monthName}-${year}.pdf`;

    const emailResult = await sendEmail({
      to: user.email,
      subject: `Monthly Financial Statement & Summary - ${monthLabel}`,
      react: EmailTemplate({
        userName: user.name,
        type: "monthly-report",
        data: {
          stats,
          month: monthLabel,
          insights,
          transactions,
        },
      }),
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    if (!emailResult.success) {
      throw new Error(
        emailResult.error?.message || "Email provider failed to send"
      );
    }

    return {
      success: true,
      message: `Statement for ${monthLabel} sent to ${user.email} with PDF attached!`,
      monthName,
      year,
      transactionCount: transactions.length,
      totalIncome: stats.totalIncome,
      totalExpenses: stats.totalExpenses,
    };
  } catch (error) {
    console.error("sendMonthlyReportEmail error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate and send monthly statement",
    };
  }
}

/**
 * Server action to directly generate and return base64 PDF for instant download.
 */
export async function downloadMonthlyReportPdfAction({ monthOffset = 1 } = {}) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized: Please sign in to download statements");
    }

    const { startDate, endDate, monthName, year } = getReportDateRange(monthOffset);
    const { stats, transactions } = await getMonthlyStatsAndTransactions(
      user.id,
      startDate,
      endDate
    );

    const pdfBuffer = await generateMonthlyReportPdf({
      userName: user.name,
      userEmail: user.email,
      monthName,
      year,
      stats,
      transactions,
    });

    return {
      success: true,
      base64: pdfBuffer.toString("base64"),
      filename: `Wealth-Statement-${monthName}-${year}.pdf`,
    };
  } catch (error) {
    console.error("downloadMonthlyReportPdfAction error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate PDF statement",
    };
  }
}
