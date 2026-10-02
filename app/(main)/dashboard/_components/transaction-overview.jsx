"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PieChart as PieIcon, ArrowRight, Plus, Sparkles, Layers } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { categoryColors } from "@/data/categories";
import { cn } from "@/lib/utils";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const FALLBACK_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f43f5e", // rose
  "#84cc16", // lime
];

function formatINR(amount) {
  const num = Math.abs(Number(amount) || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Render modern mild light-color badge pill
function renderCategoryBadge(category) {
  if (!category) return null;
  const rawColor = categoryColors[category] || "#6366f1";
  const name = category.replace(/-/g, " ");

  return (
    <span
      style={{
        backgroundColor: `${rawColor}18`,
        color: rawColor,
        borderColor: `${rawColor}35`,
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-tight shrink-0 select-none shadow-xs"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: rawColor }}
      />
      <span className="truncate max-w-[120px] sm:max-w-[160px]">{name}</span>
    </span>
  );
}

export function DashboardOverview({ accounts = [], transactions = [] }) {
  const [selectedAccountId, setSelectedAccountId] = useState("ALL");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter transactions by selected account (or "ALL" for full portfolio)
  const filteredTransactions = useMemo(() => {
    if (!selectedAccountId || selectedAccountId === "ALL") {
      return transactions;
    }
    return transactions.filter((t) => t.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  // Current month & year details
  const { currentMonth, currentYear, monthName } = useMemo(() => {
    const now = new Date();
    return {
      currentMonth: now.getMonth(),
      currentYear: now.getFullYear(),
      monthName: format(now, "MMMM"),
    };
  }, []);

  // Compute expenses by category for the current month
  const { pieChartData, totalExpenses } = useMemo(() => {
    const currentMonthExpenses = filteredTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const total = currentMonthExpenses.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    const expensesByCategory = currentMonthExpenses.reduce((acc, t) => {
      const category = t.category || "other-expense";
      acc[category] = (acc[category] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

    const chartData = Object.entries(expensesByCategory)
      .map(([category, amount], index) => ({
        name: category.replace(/-/g, " "),
        category,
        value: amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: categoryColors[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return { pieChartData: chartData, totalExpenses: total };
  }, [filteredTransactions, currentMonth, currentYear]);

  if (!isMounted || accounts.length === 0) return null;

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <PieIcon className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Expense Breakdown
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Spending distribution for {monthName} {currentYear}
          </CardDescription>
        </div>

        {/* Account Selector Filter */}
        <div className="w-full sm:w-auto">
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs rounded-xl font-medium border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs font-semibold">
                All Accounts Combined
              </SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-xs">
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex-1">
        {pieChartData.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No expenses recorded this month
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Your monthly spending is at ₹0. Add expenses or scan receipts to track your category analytics.
              </p>
            </div>
            <Link
              href="/transaction/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Transaction
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart Visualization */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="h-[220px] w-full max-w-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`₹${formatINR(val)}`, "Spent"]}
                      contentStyle={{
                        backgroundColor: "#1e1e24",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Total Spent Center Badge */}
              <div className="text-center mt-[-15px] pb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Spent
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  ₹{formatINR(totalExpenses)}
                </span>
              </div>
            </div>

            {/* Top Spending Categories List with Mild Badges & Progress */}
            <div className="md:col-span-7 space-y-3.5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-4 md:pt-0">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category Breakdown
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {pieChartData.length} active categories
                </span>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {pieChartData.slice(0, 5).map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      {renderCategoryBadge(item.category)}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          ₹{formatINR(item.value)}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-semibold w-8 text-right">
                          {item.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {/* Category percentage bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {selectedAccountId && selectedAccountId !== "ALL" && (
                <div className="pt-2 text-right">
                  <Link
                    href={`/account/${selectedAccountId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    <span>View account details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DashboardOverview;
