"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

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

const PRESET_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 30 Days", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

export function AccountChart({ transactions = [] }) {
  const [dateRange, setDateRange] = useState("1M");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute available calendar months from transactions + recent 12 calendar months
  const availableMonths = useMemo(() => {
    const monthMap = new Map();
    const now = new Date();

    // 1. Current and past 12 calendar months
    for (let i = 0; i < 12; i++) {
      const d = subMonths(now, i);
      const key = `month:${format(d, "yyyy-MM")}`;
      const isCurrent = i === 0;
      monthMap.set(key, {
        value: key,
        label: isCurrent ? `${format(d, "MMMM yyyy")} (Current)` : format(d, "MMMM yyyy"),
        rawDate: d,
      });
    }

    // 2. Include any older months that exist in user's transactions
    for (const t of transactions) {
      if (!t.date) continue;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) continue;
      const key = `month:${format(d, "yyyy-MM")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          value: key,
          label: format(d, "MMMM yyyy"),
          rawDate: d,
        });
      }
    }

    return Array.from(monthMap.values()).sort(
      (a, b) => b.rawDate.getTime() - a.rawDate.getTime()
    );
  }, [transactions]);

  const isMonthView = dateRange.startsWith("month:");

  // Quick navigation forward / backward 1 month
  const handlePrevMonth = () => {
    if (isMonthView) {
      const [year, month] = dateRange.replace("month:", "").split("-").map(Number);
      const prevDate = subMonths(new Date(year, month - 1, 1), 1);
      setDateRange(`month:${format(prevDate, "yyyy-MM")}`);
    } else {
      const prev = subMonths(new Date(), 1);
      setDateRange(`month:${format(prev, "yyyy-MM")}`);
    }
  };

  const handleNextMonth = () => {
    if (isMonthView) {
      const [year, month] = dateRange.replace("month:", "").split("-").map(Number);
      const nextDate = addMonths(new Date(year, month - 1, 1), 1);
      setDateRange(`month:${format(nextDate, "yyyy-MM")}`);
    } else {
      setDateRange(`month:${format(new Date(), "yyyy-MM")}`);
    }
  };

  const { filteredData, activeLabel, activeSubtext, rangeTransactionsCount } = useMemo(() => {
    let startDate;
    let endDate;
    let label = "";

    if (dateRange.startsWith("month:")) {
      const [year, month] = dateRange.replace("month:", "").split("-").map(Number);
      const targetDate = new Date(year, month - 1, 1);
      startDate = startOfMonth(targetDate);
      endDate = endOfMonth(targetDate);
      label = format(targetDate, "MMMM yyyy");
    } else {
      const now = new Date();
      endDate = endOfDay(now);
      const preset = PRESET_RANGES[dateRange];
      if (preset && preset.days) {
        startDate = startOfDay(subDays(now, preset.days));
        label = preset.label;
      } else {
        startDate = startOfDay(new Date(0));
        label = "All Time";
      }
    }

    const filtered = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const grouped = filtered.reduce((acc, transaction) => {
      const dateKey = format(new Date(transaction.date), "MMM dd");
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          income: 0,
          expense: 0,
          timestamp: new Date(transaction.date).getTime(),
        };
      }
      if (transaction.type === "INCOME") {
        acc[dateKey].income += transaction.amount;
      } else {
        acc[dateKey].expense += transaction.amount;
      }
      return acc;
    }, {});

    const chartData = Object.values(grouped).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    const subtext =
      dateRange === "ALL"
        ? "All Transactions"
        : `${format(startDate, "MMM dd, yyyy")} – ${format(endDate, "MMM dd, yyyy")}`;

    return {
      filteredData: chartData,
      activeLabel: label,
      activeSubtext: subtext,
      rangeTransactionsCount: filtered.length,
    };
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  if (!isMounted) return null;

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 bg-slate-50/40">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
            Transaction Overview
          </CardTitle>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            <span className="font-semibold text-slate-700">{activeLabel}</span>
            {" • "}
            <span>{activeSubtext}</span>
            {" • "}
            <span>{rangeTransactionsCount} transactions</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Quick Prev / Next Month stepper */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900"
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900"
              onClick={handleNextMonth}
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month / Range Select Dropdown */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="flex-1 sm:w-[200px] h-9 text-xs sm:text-sm rounded-xl border-slate-200 bg-white">
              <SelectValue placeholder="Select Month / Range" />
            </SelectTrigger>
            <SelectContent className="max-h-72 rounded-xl">
              <SelectGroup>
                <SelectLabel className="flex items-center gap-1.5 text-indigo-600 font-bold text-[11px] uppercase tracking-wider">
                  <CalendarIcon className="h-3 w-3" />
                  Monthly Select (Calendar)
                </SelectLabel>
                {availableMonths.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-xs sm:text-sm">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectGroup>

              <SelectSeparator />

              <SelectGroup>
                <SelectLabel className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  Preset Ranges
                </SelectLabel>
                {Object.entries(PRESET_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key} className="text-xs sm:text-sm">
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 pt-3.5 sm:pt-6">
        {/* Period Totals Summary Bar - Premium, Responsive & Non-colliding */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 p-1.5 sm:p-3 mb-5 sm:mb-6 rounded-xl sm:rounded-2xl bg-slate-50/90 border border-slate-200/80">
          {/* Total Income */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white border border-emerald-100/90 shadow-2xs text-center min-w-0">
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700/80 mb-0.5 truncate w-full">
              <span className="hidden min-[420px]:inline">Total </span>Income
            </span>
            <span
              className="text-xs min-[360px]:text-sm sm:text-base md:text-lg font-bold sm:font-extrabold text-emerald-600 tracking-tight truncate w-full"
              title={`₹${totals.income.toFixed(2)}`}
            >
              ₹{totals.income.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Total Expense */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white border border-rose-100/90 shadow-2xs text-center min-w-0">
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700/80 mb-0.5 truncate w-full">
              <span className="hidden min-[420px]:inline">Total </span>Expense
            </span>
            <span
              className="text-xs min-[360px]:text-sm sm:text-base md:text-lg font-bold sm:font-extrabold text-rose-600 tracking-tight truncate w-full"
              title={`₹${totals.expense.toFixed(2)}`}
            >
              ₹{totals.expense.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Net Balance */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white border border-indigo-100/90 shadow-2xs text-center min-w-0">
            <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5 truncate w-full">
              Net Balance
            </span>
            <span
              className={`text-xs min-[360px]:text-sm sm:text-base md:text-lg font-bold sm:font-extrabold tracking-tight truncate w-full ${
                totals.income - totals.expense >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
              title={`₹${(totals.income - totals.expense).toFixed(2)}`}
            >
              {totals.income - totals.expense < 0 ? "-₹" : "₹"}
              {Math.abs(totals.income - totals.expense).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Chart View or Empty Month Notice */}
        {filteredData.length === 0 ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <CalendarIcon className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              No transactions recorded in {activeLabel}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Use the dropdown above or the arrow buttons to browse other months like July, June, or August.
            </p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              fallback={<Skeleton className="h-[300px] w-full rounded-md" />}
            >
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value, name) => [`₹${Number(value).toFixed(2)}`, name]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "12px" }} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AccountChart;
