"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Pencil, Check, X } from "lucide-react";
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

const BudgetProgress = memo(function BudgetProgress({
  initialBudget,
  currentExpenses,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || "",
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  useEffect(() => {
    setNewBudget(initialBudget?.amount?.toString() || "");
  }, [initialBudget?.amount]);

  const percentUsed = useMemo(() => {
    if (!initialBudget?.amount) return 0;
    return (currentExpenses / initialBudget.amount) * 100;
  }, [currentExpenses, initialBudget]);

  const budgetText = useMemo(() => {
    if (!initialBudget) return "No budget set";

    return `₹${currentExpenses.toFixed(
      2,
    )} of ₹${initialBudget.amount.toFixed(2)} spent`;
  }, [currentExpenses, initialBudget]);

  const progressColor = useMemo(() => {
    if (percentUsed >= 90) return "bg-red-500";
    if (percentUsed >= 75) return "bg-yellow-500";
    return "bg-green-500";
  }, [percentUsed]);

  const handleUpdateBudget = useCallback(async () => {
    const amount = Number.parseFloat(newBudget);

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  }, [newBudget, updateBudgetFn]);

  const handleCancel = useCallback(() => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  }, [initialBudget]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBudgetChange = useCallback((e) => {
    setNewBudget(e.target.value);
  }, []);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (Default Account)
          </CardTitle>

          <div className="mt-1 flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={handleBudgetChange}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>{budgetText}</CardDescription>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {initialBudget && (
          <div className="space-y-2">
            <Progress value={percentUsed} extraStyles={progressColor} />

            <p className="text-right text-xs text-muted-foreground">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BudgetProgress.displayName = "BudgetProgress";

export default BudgetProgress;
