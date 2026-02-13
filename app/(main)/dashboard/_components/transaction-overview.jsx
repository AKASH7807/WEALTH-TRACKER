"use client";

import {useEffect, useState, useMemo} from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import {format} from "date-fns";
import {ArrowUpRight, ArrowDownRight} from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";

const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9FA8DA",
];

export function DashboardOverview({
    accounts = [],
    transactions = []
}) {
    const [selectedAccountId, setSelectedAccountId] = useState(null);

    // ✅ Safely set default account when accounts change
    useEffect(() => {
        if (accounts.length === 0) 
            return;
        

        const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];

        setSelectedAccountId(defaultAccount ?. id);
    }, [accounts]);

    // ✅ Filter transactions safely
    const accountTransactions = useMemo(() => {
        if (!selectedAccountId) 
            return [];
        
        return transactions.filter((t) => t.accountId === selectedAccountId);
    }, [transactions, selectedAccountId]);

    // ✅ Recent transactions
    const recentTransactions = useMemo(() => {
        return [... accountTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    }, [accountTransactions]);

    // ✅ Stable month/year reference
    const {currentMonth, currentYear} = useMemo(() => {
        const now = new Date();
        return {currentMonth: now.getMonth(), currentYear: now.getFullYear()};
    }, []);

    // ✅ Expense breakdown
    const pieChartData = useMemo(() => {
        const currentMonthExpenses = accountTransactions.filter((t) => {
            const transactionDate = new Date(t.date);
            return(t.type === "EXPENSE" && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear);
        });

        const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
            const category = transaction.category || "Other";
            acc[category] = (acc[category] || 0) + transaction.amount;
            return acc;
        }, {});

        return Object.entries(expensesByCategory).map(([category, amount]) => ({name: category, value: amount}));
    }, [accountTransactions, currentMonth, currentYear]);

    if (accounts.length === 0) 
        return null;
    

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Transactions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-base font-normal">
                        Recent Transactions
                    </CardTitle>

                    <Select value={
                            selectedAccountId ?? ""
                        }
                        onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Select account"/>
                        </SelectTrigger>
                        <SelectContent> {
                            accounts.map((account) => (
                                <SelectItem key={
                                        account.id
                                    }
                                    value={
                                        account.id
                                }>
                                    {
                                    account.name
                                } </SelectItem>
                            ))
                        } </SelectContent>
                    </Select>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        {
                        recentTransactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                No recent transactions
                            </p>
                        ) : (recentTransactions.map((transaction) => {
                            const isExpense = transaction.type === "EXPENSE";
                            const formattedDate = format(new Date(transaction.date), "PP");

                            return (
                                <div key={
                                        transaction.id
                                    }
                                    className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {
                                            transaction.description || "Untitled Transaction"
                                        } </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formattedDate} </p>
                                    </div>

                                    <div className={
                                        cn("flex items-center gap-1", isExpense ? "text-red-500" : "text-green-500")
                                    }>
                                        {
                                        isExpense ? (
                                            <ArrowDownRight className="h-4 w-4"/>
                                        ) : (
                                            <ArrowUpRight className="h-4 w-4"/>
                                        )
                                    }
                                        ₹{
                                        transaction.amount.toFixed(2)
                                    } </div>
                                </div>
                            );
                        }))
                    } </div>
                </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-normal">
                        Monthly Expense Breakdown
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0 pb-5">
                    {
                    pieChartData.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No expenses this month
                        </p>
                    ) : (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={
                                            ({name, value}) => `${name}: ₹${
                                                value.toFixed(2)
                                            }`
                                    }>
                                        {
                                        pieChartData.map((_, index) => (
                                            <Cell key={
                                                    `cell-${index}`
                                                }
                                                fill={
                                                    COLORS[index % COLORS.length]
                                                }/>
                                        ))
                                    } </Pie>

                                    <Tooltip formatter={
                                        (value) => `₹${
                                            value.toFixed(2)
                                        }`
                                    }/>

                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )
                } </CardContent>
            </Card>
        </div>
    );
}
