"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
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

    // convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    // check if this is the user's first account
    const existingAccountsCount = await db.account.count({
      where: { userId: user.id },
    });

    const shouldBeDefault = existingAccountsCount === 0 ? true : data.isDefault;

    // if this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
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

  const getCachedAccounts = unstable_cache(
    async (userId) => {
      const accounts = await db.account.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { transactions: true } },
        },
      });
      return accounts.map(serializeTransaction);
    },
    ["user-accounts"],
    { revalidate: 30, tags: [`accounts-${user.id}`] }
  );

  try {
    return await getCachedAccounts(user.id);
  } catch (error) {
    throw new Error(error.message);
  }
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
 * current month budget expenses directly in memory (zero redundant DB queries).
 */
export async function getCompleteDashboardData() {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const [accounts, transactions, budget] = await Promise.all([
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
  ]);

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
    accounts: accounts.map(serializeTransaction),
    transactions: transactions.map(serializeTransaction),
    budgetData: defaultAccount
      ? {
          budget: budget ? { ...budget, amount: serializeAmount(budget.amount) } : null,
          currentExpenses,
        }
      : null,
  };
}
