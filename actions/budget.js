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

export async function getCurrentBudget(accountId) {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const getCachedBudget = unstable_cache(
    async (userId, accId) => {
      const budget = await db.budget.findFirst({
        where: { userId },
      });

      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const expenses = await db.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startOfMonth, lte: endOfMonth },
          accountId: accId,
        },
        _sum: { amount: true },
      });

      return {
        budget: budget
          ? { ...budget, amount: serializeAmount(budget.amount) }
          : null,
        currentExpenses: serializeAmount(expenses._sum.amount),
      };
    },
    ["current-budget"],
    { revalidate: 30, tags: [`budget-${user.id}`] }
  );

  try {
    return await getCachedBudget(user.id, accountId);
  } catch (error) {
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat)) throw new Error("Invalid budget amount");

    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount: amountFloat,
      },
      create: {
        userId: user.id,
        amount: amountFloat,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: serializeAmount(budget.amount) },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
