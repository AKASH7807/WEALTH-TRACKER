const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const accounts = await prisma.account.findMany({
    include: { transactions: true }
  });
  for (const a of accounts) {
    const txIncome = a.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const txExpense = a.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const netTx = txIncome - txExpense;
    console.log(`Account: ${a.name} [ID: ${a.id}]`);
    console.log(`  Stored balance in DB:    ₹${a.balance}`);
    console.log(`  Transactions Income:     ₹${txIncome}`);
    console.log(`  Transactions Expense:    ₹${txExpense}`);
    console.log(`  Net sum of Transactions: ₹${netTx}`);
    console.log(`  Difference:              ₹${a.balance - netTx}`);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
