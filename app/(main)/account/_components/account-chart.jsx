"use client";

import { useState, useMemo, memo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

const DATE_RANGE_ENTRIES = Object.entries(DATE_RANGES);

const AccountChart = memo(function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];

    const now = new Date();
    const endDate = endOfDay(now);

    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const grouped = Object.create(null);

    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.date);

      if (transactionDate < startDate || transactionDate > endDate) {
        continue;
      }

      const date = format(transactionDate, "MMM dd");

      if (!grouped[date]) {
        grouped[date] = {
          date,
          income: 0,
          expense: 0,
        };
      }

      if (transaction.type === "INCOME") {
        grouped[date].income += transaction.amount;
      } else {
        grouped[date].expense += transaction.amount;
      }
    }

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [transactions, dateRange]);

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, day) => {
          acc.income += day.income;
          acc.expense += day.expense;
          return acc;
        },
        { income: 0, expense: 0 },
      ),
    [filteredData],
  );

  const balance = useMemo(
    () => totals.income - totals.expense,
    [totals.income, totals.expense],
  );

  const formatCurrency = useCallback((value) => `₹${value}`, []);

  const tooltipFormatter = useCallback((value) => [`₹${value}`, undefined], []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-normal">
          Transaction Overview
        </CardTitle>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>

          <SelectContent>
            {DATE_RANGE_ENTRIES.map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-500">
              ₹{totals.income.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold text-red-500">
              ₹{totals.expense.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Balance</p>
            <p
              className={`text-lg font-bold ${
                balance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ₹{balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />

              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{
                  backgroundColor: "#f2f3f480",
                  border: "1px solid #aeb6bf80",
                  borderRadius: "var(--radius)",
                }}
              />

              <Legend />

              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

AccountChart.displayName = "AccountChart";

export default AccountChart;
