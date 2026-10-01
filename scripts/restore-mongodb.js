/**
 * Node.js MongoDB Data Restore Script
 * ========================================================
 * Reads CSV files from `data_insert_db/` and restores all records
 * directly into MongoDB Atlas via Prisma Client using DATABASE_URL.
 * 
 * Usage:
 *   node scripts/restore-mongodb.js
 * ========================================================
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function parseCSVLine(line) {
  const values = [];
  let insideQuote = false;
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (insideQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (c === "," && !insideQuote) {
      values.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  values.push(cur);
  return values;
}

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const header = parseCSVLine(lines[0]);
  return lines.slice(1).map((l) => {
    const parts = parseCSVLine(l);
    const obj = {};
    header.forEach((h, i) => {
      const val = parts[i] !== undefined ? parts[i].trim() : "";
      obj[h.trim()] = val;
    });
    return obj;
  });
}

function toDate(val) {
  if (!val) return null;
  const clean = val.replace(" ", "T") + (val.includes("Z") ? "" : "Z");
  const d = new Date(clean);
  if (isNaN(d.getTime())) {
    const d2 = new Date(val);
    return isNaN(d2.getTime()) ? null : d2;
  }
  return d;
}

async function main() {
  console.log("=================================================");
  console.log("🚀 Starting Full Supabase to MongoDB Data Restore");
  console.log("=================================================");

  const dataDir = path.resolve(__dirname, "..", "data_insert_db");
  const users = parseCSV(path.join(dataDir, "users_rows (1).csv"));
  const accounts = parseCSV(path.join(dataDir, "accounts_rows.csv"));
  const budgets = parseCSV(path.join(dataDir, "budgets_rows.csv"));
  const transactions = parseCSV(path.join(dataDir, "transactions_rows (1).csv"));

  console.log(`Found CSV records:`);
  console.log(`  • Users:        ${users.length}`);
  console.log(`  • Accounts:     ${accounts.length}`);
  console.log(`  • Budgets:      ${budgets.length}`);
  console.log(`  • Transactions: ${transactions.length}`);

  // Clean up any test users that have conflicting clerkUserId but 0 transactions/accounts
  const validUserIds = users.map((u) => u.id);
  const validClerkIds = users.map((u) => u.clerkUserId);
  await prisma.user.deleteMany({
    where: {
      clerkUserId: { in: validClerkIds },
      id: { notIn: validUserIds },
    },
  });

  // 1. Restore Users
  console.log(`\n[1/4] Restoring Users...`);
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        clerkUserId: u.clerkUserId,
        email: u.email,
        name: u.name || null,
        imageUrl: u.imageUrl || null,
        createdAt: toDate(u.createdAt) || new Date(),
        updatedAt: toDate(u.updatedAt) || new Date(),
      },
      update: {
        clerkUserId: u.clerkUserId,
        email: u.email,
        name: u.name || null,
        imageUrl: u.imageUrl || null,
        updatedAt: toDate(u.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✔ Successfully restored ${users.length} Users`);

  // 2. Restore Accounts
  console.log(`\n[2/4] Restoring Accounts...`);
  for (const a of accounts) {
    await prisma.account.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        name: a.name,
        type: a.type,
        balance: parseFloat(a.balance) || 0,
        isDefault: a.isDefault === "true",
        userId: a.userId,
        createdAt: toDate(a.createdAt) || new Date(),
        updatedAt: toDate(a.updatedAt) || new Date(),
      },
      update: {
        name: a.name,
        type: a.type,
        balance: parseFloat(a.balance) || 0,
        isDefault: a.isDefault === "true",
        userId: a.userId,
        updatedAt: toDate(a.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✔ Successfully restored ${accounts.length} Accounts`);

  // 3. Restore Budgets
  console.log(`\n[3/4] Restoring Budgets...`);
  for (const b of budgets) {
    await prisma.budget.upsert({
      where: { id: b.id },
      create: {
        id: b.id,
        amount: parseFloat(b.amount) || 0,
        lastAlertSent: toDate(b.lastAlertSent),
        userId: b.userId,
        createdAt: toDate(b.createdAt) || new Date(),
        updatedAt: toDate(b.updatedAt) || new Date(),
      },
      update: {
        amount: parseFloat(b.amount) || 0,
        lastAlertSent: toDate(b.lastAlertSent),
        userId: b.userId,
        updatedAt: toDate(b.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✔ Successfully restored ${budgets.length} Budgets`);

  // 4. Restore Transactions
  console.log(`\n[4/4] Restoring Transactions (${transactions.length} records)...`);
  let count = 0;
  for (const t of transactions) {
    await prisma.transaction.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount) || 0,
        description: t.description || null,
        date: toDate(t.date) || new Date(),
        category: t.category,
        receiptUrl: t.receiptUrl || null,
        isRecurring: t.isRecurring === "true",
        recurringInterval: t.recurringInterval || null,
        nextRecurringDate: toDate(t.nextRecurringDate),
        lastProcessed: toDate(t.lastProcessed),
        status: t.status || "COMPLETED",
        userId: t.userId,
        accountId: t.accountId,
        createdAt: toDate(t.createdAt) || new Date(),
        updatedAt: toDate(t.updatedAt) || new Date(),
      },
      update: {
        type: t.type,
        amount: parseFloat(t.amount) || 0,
        description: t.description || null,
        date: toDate(t.date) || new Date(),
        category: t.category,
        receiptUrl: t.receiptUrl || null,
        isRecurring: t.isRecurring === "true",
        recurringInterval: t.recurringInterval || null,
        nextRecurringDate: toDate(t.nextRecurringDate),
        lastProcessed: toDate(t.lastProcessed),
        status: t.status || "COMPLETED",
        userId: t.userId,
        accountId: t.accountId,
        updatedAt: toDate(t.updatedAt) || new Date(),
      },
    });
    count++;
    if (count % 15 === 0 || count === transactions.length) {
      process.stdout.write(`   Processed ${count}/${transactions.length} transactions...\r`);
    }
  }
  console.log(`\n✔ Successfully restored all ${transactions.length} Transactions`);

  // 5. Verification & Summary
  const userCount = await prisma.user.count();
  const accountCount = await prisma.account.count();
  const budgetCount = await prisma.budget.count();
  const txCount = await prisma.transaction.count();

  console.log("\n=================================================");
  console.log("🎉 RESTORE COMPLETED AND VERIFIED IN MONGODB:");
  console.log(`  • Total Users in DB:        ${userCount}`);
  console.log(`  • Total Accounts in DB:     ${accountCount}`);
  console.log(`  • Total Budgets in DB:      ${budgetCount}`);
  console.log(`  • Total Transactions in DB: ${txCount}`);
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ Restore failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
