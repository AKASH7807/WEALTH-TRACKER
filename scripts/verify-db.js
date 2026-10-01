const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verify() {
  const users = await prisma.user.findMany({
    include: {
      accounts: {
        include: {
          _count: {
            select: { transactions: true },
          },
        },
      },
      budgets: true,
      _count: {
        select: { transactions: true },
      },
    },
  });

  console.log("=========================================");
  console.log("MONGODB CLUSTER INTEGRITY REPORT:");
  console.log("=========================================");

  for (const user of users) {
    console.log(`\nUser: ${user.name} (${user.email}) [ID: ${user.id}]`);
    console.log(`  • Clerk User ID: ${user.clerkUserId}`);
    console.log(`  • Total User Transactions: ${user._count.transactions}`);
    console.log(`  • Accounts:`);
    for (const acc of user.accounts) {
      console.log(`      - ${acc.name} (${acc.type}) | Balance: ₹${acc.balance} | Default: ${acc.isDefault} | Transactions: ${acc._count.transactions}`);
    }
    if (user.budgets?.length > 0) {
      console.log(`  • Budget: ₹${user.budgets[0].amount}`);
    }
  }

  const allTxs = await prisma.transaction.findMany();
  const totalIncome = allTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = allTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  console.log("\n-----------------------------------------");
  console.log(`Total Transactions in MongoDB: ${allTxs.length}`);
  console.log(`Total Income in MongoDB:       ₹${totalIncome.toLocaleString("en-IN")}`);
  console.log(`Total Expense in MongoDB:      ₹${totalExpense.toLocaleString("en-IN")}`);
  console.log("=========================================");
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
