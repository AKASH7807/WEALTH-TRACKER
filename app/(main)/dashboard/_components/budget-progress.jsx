"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, Target, AlertCircle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import { cn } from "@/lib/utils";

function formatINR(val) {
  const num = Math.abs(Number(val) || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function BudgetProgress({ initialBudget, currentExpenses = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const budgetAmount = initialBudget?.amount || 0;
  const percentUsed = budgetAmount > 0 ? (currentExpenses / budgetAmount) * 100 : 0;
  const remainingBudget = Math.max(0, budgetAmount - currentExpenses);
  const isOverBudget = currentExpenses > budgetAmount && budgetAmount > 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Budget
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Default Account Spending Target
            </CardDescription>
          </div>
        </div>

        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Edit budget target"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Editing mode or overview */}
        {isEditing ? (
          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Set New Monthly Limit (₹)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-sm font-semibold"
                placeholder="e.g. 50000"
                autoFocus
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={handleUpdateBudget}
                disabled={isLoading}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white h-10 px-3"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="rounded-xl h-10 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {initialBudget ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      ₹{formatINR(currentExpenses)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                      spent of ₹{formatINR(budgetAmount)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      isOverBudget
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : percentUsed >= 75
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    )}
                  >
                    {percentUsed.toFixed(0)}% used
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <Progress
                    value={Math.min(100, percentUsed)}
                    className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800"
                    extraStyles={cn(
                      "transition-all duration-500",
                      percentUsed >= 90
                        ? "bg-rose-500"
                        : percentUsed >= 75
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    )}
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-0.5">
                    <span>
                      {isOverBudget ? (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Over budget by ₹{formatINR(currentExpenses - budgetAmount)}
                        </span>
                      ) : (
                        <span>₹{formatINR(remainingBudget)} remaining</span>
                      )}
                    </span>
                    <span>Goal: ₹{formatINR(budgetAmount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  No monthly budget limit set
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full text-xs font-semibold"
                >
                  Set Budget Target
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetProgress;
