"use client";

import {useState, useMemo, useCallback} from "react";
import {toast} from "sonner";

const MonthlyFinanceInsight = () => {
    const [income, setIncome] = useState("");
    const [expenses, setExpenses] = useState("");
    const [report, setReport] = useState(null);

    // Memoized currency formatter
    const currencyFormatter = useMemo(() => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    }, []);

    // Handle numeric input (1 decimal max)
    const handleNumberInput = useCallback((value, setter) => {
        const cleaned = value.replace(/[^\d.]/g, "").replace(/(\..*?)\..*/g, "$1");
        setter(cleaned);
    }, []);

    const calculateReport = useCallback(() => {
        const inc = Number(income);
        const exp = Number(expenses);

        if (! inc || inc <= 0 || exp < 0 || Number.isNaN(inc) || Number.isNaN(exp)) {
            toast.error("Please enter valid income and expenses.");
            return;
        }

        const ratio = Math.min((exp / inc) * 100, 100);

        let suggestion = "";
        let color = "";

        if (ratio > 70) {
            suggestion = "Warning: High spending! Consider reducing expenses.";
            color = "#EF4444"; // Red
        } else if (ratio > 50) {
            suggestion = "Caution: Moderate expenses. Track carefully.";
            color = "#F59E0B"; // Orange
        } else if (ratio > 30) {
            suggestion = "Good: Healthy savings. Keep it consistent!";
            color = "#10B981"; // Green
        } else {
            suggestion = "Excellent: Very strong saving potential!";
            color = "#3B82F6"; // Blue
        }

        setReport({
            income: inc,
            expenses: exp,
            ratio: Number(ratio.toFixed(2)),
            suggestion,
            color
        });
    }, [income, expenses]);

    const isValid = Number(income) > 0 && Number(expenses) >= 0;

    // Dynamic style objects (no template literals)
    const progressBarStyle = {
        width: report ? `${
            Math.min(report.ratio, 100)
        }%` : "0%",
        backgroundColor: report ?. color || "#4CAF50",
        transition: "width 0.7s ease-out",
        height: "100%",
        borderRadius: "9999px"
    };

    const suggestionStyle = {
        borderLeftColor: report ?. color || "#4CAF50"
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-center mb-6">Monthly Finance Insight</h2>

            {/* Inputs */}
            <div className="space-y-4">
                <NumericInput label="Monthly Income"
                    value={income}
                    onChange={
                        (val) => handleNumberInput(val, setIncome)
                    }/>
                <NumericInput label="Monthly Expenses"
                    value={expenses}
                    onChange={
                        (val) => handleNumberInput(val, setExpenses)
                    }/>
            </div>

            {/* Button */}
            <button onClick={calculateReport}
                disabled={
                    ! isValid
                }
                className={
                    `w-full mt-6 py-2.5 rounded-lg text-white font-medium transition ${
                        isValid ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:opacity-95 shadow-md" : "bg-gray-300 cursor-not-allowed"
                    }`
            }>
                Generate Report
            </button>

            {/* Report Section */}
            {
            report && (
                <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SummaryCard title="Income"
                            value={
                                currencyFormatter.format(report.income)
                            }/>
                        <SummaryCard title="Expenses"
                            value={
                                currencyFormatter.format(report.expenses)
                            }/>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div style={progressBarStyle}/>
                    </div>
                    <p className="text-right text-xs mt-1 text-gray-500">
                        Expense Ratio: {
                        report.ratio
                    }%
                    </p>

                    {/* Suggestion */}
                    <div className="p-4 rounded-xl border-l-4 bg-gray-50 text-sm sm:text-base"
                        style={suggestionStyle}>
                        {
                        report.suggestion
                    } </div>
                </div>
            )
        } </div>
    );
};

// Reusable Numeric Input Component
const NumericInput = ({label, value, onChange}) => (
    <div>
        <label className="block text-sm font-medium mb-1">
            {label}</label>
        <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition">
            <span className="px-3 bg-gray-100 text-gray-600 text-sm">₹</span>
            <input type="text" inputMode="decimal" placeholder="0"
                value={value}
                onChange={
                    (e) => onChange(e.target.value)
                }
                className="w-full p-2.5 outline-none text-sm sm:text-base"/>
        </div>
    </div>
);

// Reusable Summary Card Component
const SummaryCard = ({title, value}) => (
    <div className="bg-gray-50 p-4 rounded-xl border text-center">
        <p className="text-xs text-gray-500">
            {title}</p>
        <p className="text-lg font-semibold break-words">
            {value}</p>
    </div>
);

export default MonthlyFinanceInsight;
