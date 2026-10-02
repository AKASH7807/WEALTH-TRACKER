import { getCompleteDashboardData } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";
import React, { Suspense } from "react";
import Link from "next/link";
import AccountCard from "./_components/account-card";
import BudgetProgress from "./_components/budget-progress";
import { DashboardOverview } from "./_components/transaction-overview";
import { DashboardStats } from "./_components/dashboard-stats";
import DashboardSkeleton from "./_components/dashboard-skeleton";

export const dynamic = "force-dynamic";

// Async sub-component: fetches accounts, transactions, and budget in a single parallel batch
async function DashboardContent() {
  const { accounts, transactions, budgetData } =
    await getCompleteDashboardData();

  const defaultAccount = accounts?.find((account) => account.isDefault);

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* 1. Executive Financial Summary Metric Cards + Quick Actions Hub */}
      <DashboardStats accounts={accounts} transactions={transactions || []} />

      {/* 2. Monthly Budget Progress & Spending Analytics Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Monthly Budget Card */}
        {defaultAccount && (
          <div className="lg:col-span-5">
            <BudgetProgress
              initialBudget={budgetData?.budget}
              currentExpenses={budgetData?.currentExpenses || 0}
            />
          </div>
        )}

        {/* Monthly Expense Breakdown Donut & Top Categories */}
        <div className={defaultAccount ? "lg:col-span-7" : "lg:col-span-12"}>
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
          />
        </div>
      </div>

      {/* 3. Accounts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Your Accounts
            </h2>
          </div>
          <Link
            href="/transaction/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 px-3 py-1.5 rounded-full transition-colors"
          >
            <Tag className="h-3.5 w-3.5" />
            Manage Categories
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800 transition-all cursor-pointer border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-2xl min-h-[160px] flex items-center justify-center group">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground p-6">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Add New Account
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Savings, Current, Credit Card
                </p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {accounts.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
