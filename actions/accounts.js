"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper to serialize Decimal fields to numbers
const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) serialized.balance = obj.balance.toNumber();
  if (obj.amount) serialized.amount = obj.amount.toNumber();
  return serialized;
};

// Calculate account balance from transactions (Income - Expenses)
export async function calculateAccountBalance(accountId) {
  try {
    const transactions = await db.transaction.findMany({
      where: { accountId },
    });

    const balance = transactions.reduce((sum, tx) => {
      const amount = tx.amount.toNumber();
      return tx.type === "INCOME" ? sum + amount : sum - amount;
    }, 0);

    return balance;
  } catch (error) {
    throw error;
  }
}

// Update the default account
export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("user not found");

    // Unset previous default and set new default in parallel for speed
    await Promise.all([
      db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      }),
      db.account.update({
        where: { id: accountId, userId: user.id },
        data: { isDefault: true },
      }),
    ]);

    // Fetch the updated account to return serialized data
    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get an account along with its transactions
export async function getAccountWithTransaction(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("user not found");

    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 1000, // Limit to prevent fetching huge datasets
        },
        _count: { select: { transactions: true } },
      },
    });

    if (!account) return null;

    // Calculate balance from transactions (Income - Expenses)
    const calculatedBalance = account.transactions.reduce((sum, tx) => {
      const amount = tx.amount.toNumber();
      return tx.type === "INCOME" ? sum + amount : sum - amount;
    }, 0);

    return {
      ...serializeTransaction(account),
      balance: calculatedBalance,
      transactions: account.transactions.map(serializeTransaction),
    };
  } catch (error) {
    throw error;
  }
}

// Recalculate all account balances based on transactions
export async function recalculateAccountBalances() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Get all accounts for the user
    const accounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // Get all transactions for the user
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
    });

    // Calculate correct balance for each account
    const balanceUpdates = accounts.map((account) => {
      const accountTransactions = transactions.filter(
        (tx) => tx.accountId === account.id
      );

      // Calculate balance: sum of all income - sum of all expenses
      const correctBalance = accountTransactions.reduce((sum, tx) => {
        const amount = tx.amount.toNumber();
        return tx.type === "INCOME" ? sum + amount : sum - amount;
      }, 0);

      return { accountId: account.id, correctBalance };
    });

    // Update all accounts in a single transaction
    await db.$transaction(
      balanceUpdates.map((update) =>
        db.account.update({
          where: { id: update.accountId },
          data: { balance: update.correctBalance },
        })
      )
    );

    revalidatePath("/dashboard");
    accounts.forEach((account) =>
      revalidatePath(`/account/${account.id}`)
    );

    return {
      success: true,
      message: "Account balances recalculated successfully",
      updates: balanceUpdates,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Bulk delete transactions
export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Fetch transactions to get affected account IDs
    const transactions = await db.transaction.findMany({
      where: { id: { in: transactionIds }, userId: user.id },
    });

    const affectedAccountIds = [...new Set(transactions.map((tx) => tx.accountId))];

    // Delete transactions only (balance is calculated from remaining transactions)
    await db.transaction.deleteMany({
      where: { id: { in: transactionIds }, userId: user.id },
    });

    // Revalidate dashboard and all affected accounts
    revalidatePath("/dashboard");
    affectedAccountIds.forEach((id) => revalidatePath(`/account/${id}`));

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
