"use client";

import React, { useState, useMemo } from "react";
import AccountChart from "./account-chart";
import TransactionTable from "./tansaction-table";
import { Switch } from "@/components/ui/switch";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountView({ account, transactions, categories = [] }) {
  // Default is OFF so the main transaction list is front and center
  const [showGraph, setShowGraph] = useState(false);

  const netTransactionBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === "INCOME" ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0);
  }, [transactions]);

  return (
    <div className="space-y-5 sm:space-y-6 px-0 sm:px-1">
      {/* Account Top Summary Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight truncate">
              {account.name}
            </h1>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {account.type.toLowerCase()}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {account._count?.transactions || transactions.length} Total Transactions
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
          {/* Balance display */}
          <div className="text-left sm:text-right">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
              Net Balance
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {netTransactionBalance < 0 ? "-₹" : "₹"}
              {Math.abs(netTransactionBalance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Graph Toggle Switch (Default OFF) */}
          <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all">
            <div
              className={cn(
                "p-1 rounded-full transition-colors",
                showGraph
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  : "text-slate-400"
              )}
            >
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 select-none">
              View Graph
            </span>
            <Switch
              checked={showGraph}
              onCheckedChange={setShowGraph}
              aria-label="Toggle Monthly Overview Graph"
            />
          </div>
        </div>
      </div>

      {/* Monthly Graph Section - ONLY displayed when showGraph is true */}
      {showGraph && (
        <div className="transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-3">
          <AccountChart transactions={transactions} />
        </div>
      )}

      {/* Main Activity / Transaction List */}
      <div>
        <TransactionTable
          transactions={transactions}
          categories={categories}
          accountName={account.name}
        />
      </div>
    </div>
  );
}
