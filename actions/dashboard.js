"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { defaultCategories } from "@/data/categories";
import { revalidatePath, unstable_cache } from "next/cache";

const serializeAmount = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof val?.toNumber === "function") return val.toNumber();
  return Number(val) || 0;
};

// Safe serializer to prevent crashes on null/0
const serializeTransaction = (obj) => {
  if (!obj) return obj;
  return {
    ...obj,
    balance: serializeAmount(obj.balance),
    amount: serializeAmount(obj.amount),
  };
};

export async function createAccount(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    // Default balance to 0 - no initial amount needed
    const rawBalance = data.balance ? parseFloat(data.balance) : 0;
    const balanceFloat = isNaN(rawBalance) ? 0 : rawBalance;

    // check if this is the user's first account
    const existingAccountsCount = await db.account.count({
      where: { userId: user.id },
    });

    const shouldBeDefault = existingAccountsCount === 0 ? true : Boolean(data.isDefault);

    // if this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccounts() {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const [accounts, transactions] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { transactions: true } },
      },
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      select: { accountId: true, type: true, amount: true },
    }),
  ]);

  const accountBalances = {};
  for (const t of transactions) {
    const amt = serializeAmount(t.amount);
    const change = t.type === "EXPENSE" ? -amt : amt;
    accountBalances[t.accountId] = (accountBalances[t.accountId] || 0) + change;
  }

  return accounts.map((acc) => {
    const serialized = serializeTransaction(acc);
    const net =
      accountBalances[acc.id] !== undefined
        ? Math.round(accountBalances[acc.id] * 100) / 100
        : 0;
    return {
      ...serialized,
      balance: net,
    };
  });
}

export async function getDashboardData() {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const getCachedTransactions = unstable_cache(
    async (userId) => {
      const transactions = await db.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      });
      return transactions.map(serializeTransaction);
    },
    ["dashboard-transactions"],
    { revalidate: 30, tags: [`transactions-${user.id}`] }
  );

  try {
    return await getCachedTransactions(user.id);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Ultra-fast consolidated data fetcher for Dashboard.
 * Fetches accounts, transactions, and budget in parallel and calculates
 * true net transaction balances (Income - Expense) with zero initial-amount skew.
 */
export async function getCompleteDashboardData() {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const [accounts, transactions, budget, customCategories] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { transactions: true } },
      },
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
    db.budget.findFirst({
      where: { userId: user.id },
    }),
    db.category.findMany({
      where: { userId: user.id },
    }),
  ]);

  // Fast category lookup map
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

  const enrichedTransactions = transactions.map((t) => {
    const serialized = serializeTransaction(t);
    const catInfo = catMap.get(t.category);
    return {
      ...serialized,
      categoryName: catInfo ? catInfo.name : (t.category ? t.category.replace(/-/g, " ") : ""),
      categoryColor: catInfo ? catInfo.color : "#6366f1",
      categoryIcon: catInfo ? catInfo.icon : "Tag",
    };
  });

  // Compute true transaction-based balance for each account (Income - Expense)
  // so that artificial initial balance amounts do not skew the display!
  const accountBalances = {};
  for (const t of transactions) {
    const amt = serializeAmount(t.amount);
    const change = t.type === "EXPENSE" ? -amt : amt;
    accountBalances[t.accountId] = (accountBalances[t.accountId] || 0) + change;
  }

  const enrichedAccounts = accounts.map((acc) => {
    const serialized = serializeTransaction(acc);
    const net =
      accountBalances[acc.id] !== undefined
        ? Math.round(accountBalances[acc.id] * 100) / 100
        : 0;
    return {
      ...serialized,
      balance: net,
    };
  });

  const defaultAccount = accounts.find((a) => a.isDefault);
  let currentExpenses = 0;

  if (defaultAccount) {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    currentExpenses = transactions
      .filter(
        (t) =>
          t.accountId === defaultAccount.id &&
          t.type === "EXPENSE" &&
          new Date(t.date) >= startOfMonth &&
          new Date(t.date) <= endOfMonth
      )
      .reduce((sum, t) => sum + serializeAmount(t.amount), 0);
  }

  return {
    accounts: enrichedAccounts,
    transactions: enrichedTransactions,
    budgetData: defaultAccount
      ? {
          budget: budget ? { ...budget, amount: serializeAmount(budget.amount) } : null,
          currentExpenses,
        }
      : null,
  };
}
