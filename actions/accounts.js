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
        transactions: { orderBy: { date: "desc" } },
        _count: { select: { transactions: true } },
      },
    });

    if (!account) return null;

    return {
      ...serializeTransaction(account),
      transactions: account.transactions.map(serializeTransaction),
    };
  } catch (error) {
    throw error;
  }
}

// Bulk delete transactions
export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Fetch transactions once
    const transactions = await db.transaction.findMany({
      where: { id: { in: transactionIds }, userId: user.id },
    });

    // Compute balance changes per account
    const accountBalanceChanges = transactions.reduce((acc, tx) => {
      const change = tx.type === "EXPENSE" ? tx.amount : -tx.amount;
      acc[tx.accountId] = (acc[tx.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update balances in a single transaction
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { id: { in: transactionIds }, userId: user.id },
      });

      // Run all account updates in parallel for speed
      await Promise.all(
        Object.entries(accountBalanceChanges).map(
          ([accountId, balanceChange]) =>
            tx.account.update({
              where: { id: accountId },
              data: { balance: { increment: balanceChange } },
            })
        )
      );
    });

    // Revalidate dashboard and all affected accounts
    revalidatePath("/dashboard");
    Object.keys(accountBalanceChanges).forEach((id) =>
      revalidatePath(`/account/${id}`)
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
