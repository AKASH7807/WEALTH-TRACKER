"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
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
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    return accounts.map(serializeTransaction);
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    throw new Error(error.message);
  }
}
