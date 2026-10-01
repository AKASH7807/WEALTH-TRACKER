"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Loader2,
  Wallet,
  Tag,
  Repeat,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description || "",
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id || accounts[0]?.id || "",
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!editMode && !initialData) {
      setValue("date", new Date());
    }
  }, [editMode, initialData, setValue]);

  const onSubmit = async (data) => {
    const formData = { ...data, amount: parseFloat(data.amount) };
    if (editMode) await transactionFn(editId, formData);
    else await transactionFn(formData);
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      if (scannedData.amount) setValue("amount", scannedData.amount.toString());
      if (scannedData.date) setValue("date", new Date(scannedData.date));
      if (scannedData.description) setValue("description", scannedData.description);
      if (scannedData.category) setValue("category", scannedData.category);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  if (!isMounted) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-3xl mx-auto"
    >
      {/* Receipt Scanner (Shown in Create Mode) */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 shadow-sm space-y-6">
        {/* Section 1: Type Segmented Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setValue("type", "EXPENSE");
                setValue("category", ""); // reset category when type changes
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200",
                type === "EXPENSE"
                  ? "bg-white text-rose-600 shadow-sm border border-rose-200/70"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <TrendingDown className="h-4 w-4" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("type", "INCOME");
                setValue("category", ""); // reset category when type changes
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200",
                type === "INCOME"
                  ? "bg-white text-emerald-600 shadow-sm border border-emerald-200/70"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Income</span>
            </button>
          </div>
          {errors.type && (
            <p className="text-xs font-medium text-rose-500">{errors.type.message}</p>
          )}
        </div>

        {/* Section 2: Prominent Amount Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="amount"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Amount
          </label>
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-2 sm:p-3 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl font-bold text-slate-400 pl-2 select-none">
                ₹
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-transparent px-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none"
                {...register("amount")}
              />
            </div>
          </div>
          {errors.amount && (
            <p className="text-xs font-medium text-rose-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Section 3: Multi-column Grid for Account & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Account */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Account</span>
              <CreateAccountDrawer>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                >
                  + New Account
                </button>
              </CreateAccountDrawer>
            </label>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <div className="flex items-center gap-2 truncate">
                      <Wallet className="h-4 w-4 text-slate-400 shrink-0" />
                      <SelectValue placeholder="Select account" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="rounded-lg">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium text-slate-900">{account.name}</span>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            ₹{parseFloat(account.balance).toFixed(2)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountId && (
              <p className="text-xs font-medium text-rose-500">{errors.accountId.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <div className="flex items-center gap-2 truncate">
                      <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                      <SelectValue placeholder="Select category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 max-h-64">
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="rounded-lg capitalize">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs font-medium text-rose-500">{errors.category.message}</p>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 w-full justify-start rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm font-normal transition-all hover:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => setValue("date", date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs font-medium text-rose-500">{errors.date.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Description / Merchant
            </label>
            <div className="relative">
              <Input
                id="description"
                placeholder="e.g. Grocery Store, Client Payment"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register("description")}
              />
            </div>
            {errors.description && (
              <p className="text-xs font-medium text-rose-500">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Section 4: Recurring Transaction Settings */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Repeat className="h-4 w-4" />
              </div>
              <div>
                <label
                  htmlFor="isRecurring"
                  className="text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  Recurring Transaction
                </label>
                <p className="text-xs text-slate-500">
                  Automatically repeat this transaction on a schedule
                </p>
              </div>
            </div>

            <Controller
              name="isRecurring"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isRecurring"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Expanded Recurring Interval Selector */}
          {isRecurring && (
            <div className="mt-4 pt-3 border-t border-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Repeat Interval
              </label>
              <Controller
                name="recurringInterval"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="DAILY" className="rounded-lg">Daily</SelectItem>
                      <SelectItem value="WEEKLY" className="rounded-lg">Weekly</SelectItem>
                      <SelectItem value="MONTHLY" className="rounded-lg">Monthly</SelectItem>
                      <SelectItem value="YEARLY" className="rounded-lg">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recurringInterval && (
                <p className="text-xs font-medium text-rose-500 mt-1">
                  {errors.recurringInterval.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 5: Action Buttons (Desktop Inline, Mobile Touch-Friendly) */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto sm:px-8 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-all"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={transactionLoading}
            className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] text-base"
          >
            {transactionLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {editMode ? "Saving Changes..." : "Creating Transaction..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {editMode ? "Update Transaction" : "Save Transaction"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default AddTransactionForm;
