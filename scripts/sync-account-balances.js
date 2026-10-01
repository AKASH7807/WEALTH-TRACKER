const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function syncBalances() {
  console.log("Synchronizing account balances to net transaction sums...");
  const accounts = await prisma.account.findMany({
    include: { transactions: true },
  });

  for (const acc of accounts) {
    const income = acc.transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + (typeof t.amount === "number" ? t.amount : Number(t.amount) || 0), 0);
    const expense = acc.transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + (typeof t.amount === "number" ? t.amount : Number(t.amount) || 0), 0);
    const net = Math.round((income - expense) * 100) / 100;

    await prisma.account.update({
      where: { id: acc.id },
      data: { balance: net },
    });

    console.log(`✔ Account "${acc.name}" (${acc.id}): old balance = ₹${acc.balance} -> new net balance = ₹${net}`);
  }

  console.log("All account balances successfully synchronized!");
}

syncBalances()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
