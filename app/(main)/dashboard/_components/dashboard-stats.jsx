"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Plus,
  Camera,
  Tag,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatINR(val) {
  const num = Math.abs(Number(val) || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DashboardStats({ accounts = [], transactions = [] }) {
  // Aggregate total net balance across all accounts
  const totalWealth = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
  }, [accounts]);

  // Current month financial flow
  const { monthlyIncome, monthlyExpense, netCashflow, savingsRate } =
    useMemo(() => {
      const now = new Date();
      const curMonth = now.getMonth();
      const curYear = now.getFullYear();

      let inc = 0;
      let exp = 0;

      for (const t of transactions) {
        const d = new Date(t.date);
        if (d.getMonth() === curMonth && d.getFullYear() === curYear) {
          const amt = Number(t.amount) || 0;
          if (t.type === "INCOME") inc += amt;
          else if (t.type === "EXPENSE") exp += amt;
        }
      }

      const net = inc - exp;
      const rate = inc > 0 ? (net / inc) * 100 : 0;

      return {
        monthlyIncome: inc,
        monthlyExpense: exp,
        netCashflow: net,
        savingsRate: rate,
      };
    }, [transactions]);

  return (
    <div className="space-y-4">
      {/* 4 Financial Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Net Worth */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs overflow-hidden relative group hover:border-purple-300 transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Net Worth
              </span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalWealth < 0 ? "-₹" : "₹"}
                {formatINR(totalWealth)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {accounts.length} active account{accounts.length > 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Monthly Inflow */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs overflow-hidden relative group hover:border-emerald-300 transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Inflow
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                +₹{formatINR(monthlyIncome)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Income this month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Monthly Outflow */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs overflow-hidden relative group hover:border-rose-300 transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Outflow
              </span>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                -₹{formatINR(monthlyExpense)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Expenses this month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Net Cashflow */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs overflow-hidden relative group hover:border-blue-300 transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Net Cashflow
              </span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <PiggyBank className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div
                className={cn(
                  "text-xl sm:text-2xl font-black tracking-tight",
                  netCashflow >= 0
                    ? "text-slate-900 dark:text-white"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {netCashflow < 0 ? "-₹" : "₹"}
                {formatINR(netCashflow)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {monthlyIncome > 0 ? (
                  <span
                    className={
                      netCashflow >= 0
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-rose-600 dark:text-rose-400 font-semibold"
                    }
                  >
                    {savingsRate.toFixed(0)}% savings rate
                  </span>
                ) : (
                  "Net monthly savings"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <Link
          href="/transaction/create"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs shrink-0 transition-transform active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Transaction</span>
        </Link>
        <Link
          href="/transaction/categories"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs shrink-0 transition-transform active:scale-95"
        >
          <Tag className="h-3.5 w-3.5 text-indigo-600" />
          <span>Manage Categories</span>
        </Link>
      </div>
    </div>
  );
}

export default DashboardStats;
