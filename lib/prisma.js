import { PrismaClient } from "@prisma/client";

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

/**
 * Runs a transactional operation.
 * If MongoDB is deployed as a replica set (like MongoDB Atlas), it uses Prisma's interactive $transaction.
 * If the MongoDB instance is standalone without replica set support, it gracefully executes operations sequentially.
 */
export async function runDbTransaction(callback) {
  try {
    return await db.$transaction(callback);
  } catch (error) {
    if (
      error.message &&
      (error.message.includes("replica set") ||
        error.message.includes("Transaction numbers are only allowed on a replica set member"))
    ) {
      console.warn("MongoDB replica set not detected, running operations without transaction wrapper");
      return await callback(db);
    }
    throw error;
  }
}
