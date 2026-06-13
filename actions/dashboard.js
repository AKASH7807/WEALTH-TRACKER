"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Safe serializer to prevent crashes on null/0
const serializeTransaction = (obj) => ({
  ...obj,
  balance:
    obj.balance !== null && obj.balance !== undefined
      ? obj.balance.toNumber()
      : 0,
  amount:
    obj.amount !== null && obj.amount !== undefined ? obj.amount.toNumber() : 0,
});

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) throw new Error("user not found");

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
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) throw new Error("user not found");

    // Fetch accounts with transaction aggregates for balance calculation
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // For each account, calculate balance from recent transactions only
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        // Only sum recent transactions for balance (last 1000)
        const transactions = await db.transaction.findMany({
          where: { accountId: account.id },
          select: { type: true, amount: true },
          take: 1000,
          orderBy: { date: "desc" },
        });

        const balance = transactions.reduce((sum, tx) => {
          const amount = tx.amount.toNumber();
          return tx.type === "INCOME" ? sum + amount : sum - amount;
        }, 0);

        return {
          ...serializeTransaction(account),
          balance,
          _count: { transactions: transactions.length },
        };
      })
    );

    return accountsWithBalance;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!user) throw new Error("User not Found");

    // Optimized: limit to recent 100 transactions instead of all
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 100, // Limit results for performance
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
        category: true,
        accountId: true,
      },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    throw new Error(error.message);
  }
}
