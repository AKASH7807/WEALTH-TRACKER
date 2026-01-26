"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export default function MonthlyFinanceInsight() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [report, setReport] = useState(null);

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  const calculateReport = () => {
    const inc = parseFloat(income);
    const exp = parseFloat(expenses);

    if (isNaN(inc) || isNaN(exp) || inc <= 0) {
      toast.error("Please enter value.");
      return;
    }

    const ratio = (exp / inc) * 100;

    let suggestion = "";
    let color = "";

    if (ratio > 70) {
      suggestion =
        "Warning: You are spending a high portion of your income. Consider reducing expenses.";
      color = "#F87171"; // red
    } else if (ratio > 50) {
      suggestion =
        "Caution: Expenses are moderate compared to your income. Keep tracking.";
      color = "#FBBF24"; // yellow
    } else if (ratio > 30) {
      suggestion =
        "Good: Expenses are under control, you’re saving a healthy portion.";
      color = "#34D399"; // green
    } else {
      suggestion =
        "Excellent: You’re spending very little of your income. Opportunity to save or invest more.";
      color = "#60A5FA"; // blue
    }

    setReport({
      income: inc,
      expenses: exp,
      ratio: Number(ratio.toFixed(2)),
      suggestion,
      color,
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Monthly Finance Insight
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Monthly income
          </label>
          <div className="flex items-center border rounded-md overflow-hidden">
            <span className="px-3 bg-gray-100 text-sm">₹</span>
            <input
              inputMode="numeric"
              type="text"
              placeholder="25,000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="flex-1 p-2 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Monthly expenses
          </label>
          <div className="flex items-center border rounded-md overflow-hidden">
            <span className="px-3 bg-gray-100 text-sm">₹</span>
            <input
              inputMode="numeric"
              type="text"
              placeholder="15,000"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="flex-1 p-2 outline-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={calculateReport}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-2 rounded-md shadow-md hover:opacity-95 transition"
      >
        Generate Report
      </button>

      {report && (
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-md border">
              <div className="text-sm text-gray-500">Income</div>
              <div className="text-xl font-semibold">
                {currencyFormatter.format(report.income)}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-md border">
              <div className="text-sm text-gray-500">Expenses</div>
              <div className="text-xl font-semibold">
                {currencyFormatter.format(report.expenses)}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full"
              style={{
                width: `${report.ratio}%`,
                background: `linear-gradient(90deg, ${report.color}, #6d28d9)`,
                transition: "width 0.6s ease",
              }}
            />
          </div>

          <div
            className="p-3 rounded-md"
            style={{
              borderLeft: `4px solid ${report.color}`,
              background: "#fff",
            }}
          >
            <div className="font-medium mb-1">{report.suggestion}</div>
            <div className="text-sm text-gray-500">
              Expense ratio:{" "}
              <span className="font-medium">{report.ratio}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
