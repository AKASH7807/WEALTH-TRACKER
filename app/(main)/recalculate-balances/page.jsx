"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function RecalculateBalancesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recalculate-balances", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast.success(data.message || "Balances recalculated successfully!");
      } else {
        toast.error(data.error || "Failed to recalculate balances");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 px-5">
      <div>
        <h1 className="text-3xl font-semibold gradient-title">
          Recalculate Account Balances
        </h1>
        <p className="text-muted-foreground mt-2">
          Fix inconsistent account balances by recalculating them based on all transactions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Balance Recalculation Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This tool will recalculate all your account balances by summing up all income and expense transactions. 
            This is useful if you notice discrepancies between your account balance and the sum of your transactions.
          </p>

          <Button
            onClick={handleRecalculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600"
          >
            {loading ? "Recalculating..." : "Recalculate All Balances"}
          </Button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-900 mb-2">Success!</p>
              <p className="text-sm text-green-800 mb-3">{result.message}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-900">Updated Accounts:</p>
                <ul className="text-sm text-green-800 space-y-1">
                  {result.updates?.map((update) => (
                    <li key={update.accountId}>
                      • Account {update.accountId.slice(0, 8)}... → ₹{update.correctBalance.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
