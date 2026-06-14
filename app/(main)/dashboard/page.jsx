import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";

import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

import AccountCard from "./_components/account-card";
import BudgetProgress from "./_components/budget-progress";
import { DashboardOverview } from "./_components/transaction-overview";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [accounts = [], transactions = []] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts.find((account) => account.isDefault) ?? null;

  const budgetData = defaultAccount
    ? await getCurrentBudget(defaultAccount.id)
    : null;

  return (
    <div className="space-y-8">
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses ?? 0}
        />
      )}

      <DashboardOverview accounts={accounts} transactions={transactions} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="cursor-pointer border-dashed hover:shadow-md">
            <CardContent className="flex h-full flex-col items-center justify-center pt-5 text-muted-foreground">
              <Plus className="mb-2 h-10 w-10" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}
