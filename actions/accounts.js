"use server";

import { db, runDbTransaction } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

// Helper to serialize Decimal / Float fields safely to numbers
const serializeAmount = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof val?.toNumber === "function") return val.toNumber();
  return Number(val) || 0;
};

const serializeTransaction = (obj) => {
  if (!obj) return obj;
  const serialized = { ...obj };
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = serializeAmount(obj.balance);
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = serializeAmount(obj.amount);
  }
  return serialized;
};

// Update the default account
export async function updateDefaultAccount(accountId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

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

// Update account name
export async function updateAccountName(accountId, newName) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const trimmedName = newName?.trim();
    if (!trimmedName) {
      return { success: false, error: "Account name cannot be empty" };
    }

    const updatedAccount = await db.account.update({
      where: { id: accountId, userId: user.id },
      data: { name: trimmedName },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);
    return { success: true, data: serializeTransaction(updatedAccount) };
  } catch (error) {
    console.error("updateAccountName error:", error);
    return {
      success: false,
      error: error.message || "Failed to update account name",
    };
  }
}

// Get an account along with its transactions
export async function getAccountWithTransaction(accountId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

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
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    // Fetch transactions once
    const transactions = await db.transaction.findMany({
      where: { id: { in: transactionIds }, userId: user.id },
    });

    // Compute balance changes per account
    const accountBalanceChanges = transactions.reduce((acc, tx) => {
      const txAmount = serializeAmount(tx.amount);
      const change = tx.type === "EXPENSE" ? txAmount : -txAmount;
      acc[tx.accountId] = (acc[tx.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update balances in a transaction
    await runDbTransaction(async (tx) => {
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
