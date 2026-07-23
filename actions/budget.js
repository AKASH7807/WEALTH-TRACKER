"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath, unstable_cache } from "next/cache";

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
          ? { ...budget, amount: budget.amount.toNumber() }
          : null,
        currentExpenses: expenses._sum.amount
          ? expenses._sum.amount.toNumber()
          : 0,
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

    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
