"use client";

import { useEffect, useState, useMemo, memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

const DashboardOverview = memo(function DashboardOverview({
  accounts = [],
  transactions = [],
}) {
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    if (!accounts.length) return;

    const defaultAccount =
      accounts.find((account) => account.isDefault) || accounts[0];

    setSelectedAccountId(defaultAccount.id);
  }, [accounts]);

  const accountTransactions = useMemo(() => {
    if (!selectedAccountId) return [];

    return transactions.filter(
      (transaction) => transaction.accountId === selectedAccountId,
    );
  }, [transactions, selectedAccountId]);

  const recentTransactions = useMemo(() => {
    return accountTransactions
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [accountTransactions]);

  const currentDate = useMemo(() => {
    const now = new Date();

    return {
      month: now.getMonth(),
      year: now.getFullYear(),
    };
  }, []);

  const pieChartData = useMemo(() => {
    const expensesByCategory = {};

    for (const transaction of accountTransactions) {
      if (transaction.type !== "EXPENSE") continue;

      const transactionDate = new Date(transaction.date);

      if (
        transactionDate.getMonth() !== currentDate.month ||
        transactionDate.getFullYear() !== currentDate.year
      ) {
        continue;
      }

      const category = transaction.category || "Other";

      expensesByCategory[category] =
        (expensesByCategory[category] || 0) + transaction.amount;
    }

    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [accountTransactions, currentDate]);

  if (!accounts.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>

          <Select
            value={selectedAccountId ?? ""}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>

            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction) => {
                const isExpense = transaction.type === "EXPENSE";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {transaction.description || "Untitled Transaction"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1",
                        isExpense ? "text-red-500" : "text-green-500",
                      )}
                    >
                      {isExpense ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                      ₹{Number(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 pb-5">
          {pieChartData.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              No expenses this month
            </p>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

DashboardOverview.displayName = "DashboardOverview";

export { DashboardOverview };
