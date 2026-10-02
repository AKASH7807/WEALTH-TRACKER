"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Loader2,
  Wallet,
  Tag,
  Repeat,
  TrendingDown,
  TrendingUp,
  FileText,
  CheckCircle2,
  Receipt,
  ArrowRight,
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
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts = [],
  categories = [],
  descriptionSuggestions = [],
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const defaultAccountId =
    accounts.find((ac) => ac.isDefault)?.id || accounts[0]?.id || "";

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
            accountId: defaultAccountId,
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

  const watchedType = watch("type");
  const watchedAmount = watch("amount");
  const watchedAccountId = watch("accountId");
  const watchedCategory = watch("category");
  const watchedDate = watch("date");
  const watchedDescription = watch("description");
  const isRecurring = watch("isRecurring");

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === watchedType),
    [categories, watchedType]
  );

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === watchedAccountId),
    [accounts, watchedAccountId]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === watchedCategory),
    [categories, watchedCategory]
  );

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!descriptionSuggestions || descriptionSuggestions.length === 0) return [];
    const query = (watchedDescription || "").toLowerCase().trim();
    if (!query) return [];
    return descriptionSuggestions
      .filter((s) => s.description.toLowerCase().includes(query))
      .slice(0, 5);
  }, [descriptionSuggestions, watchedDescription]);

  const handleSelectSuggestion = (suggestion) => {
    setValue("description", suggestion.description, { shouldValidate: true });
    // If category is not set, or matches the suggestion's type, auto-select it if found in categories
    if (!watchedCategory && suggestion.category) {
      const foundCat = categories.find(
        (c) =>
          c.id === suggestion.category ||
          c.name.toLowerCase() === suggestion.category.toLowerCase()
      );
      if (foundCat && foundCat.type === watchedType) {
        setValue("category", foundCat.id, { shouldValidate: true });
      }
    }
    setShowSuggestions(false);
  };

  if (!isMounted) return null;

  return (
    <div className="w-full">
      {/* Mobile-only Receipt Scanner placed above the form */}
      {!editMode && (
        <div className="block lg:hidden mb-6">
          <ReceiptScanner onScanComplete={handleScanComplete} />
        </div>
      )}

      {/* Main Grid: Form on Left, Scanner & Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-7 xl:col-span-7 space-y-6"
        >
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-5">
            {/* Row 1: Type & Amount Grid (Aligned 50/50 on desktop, stacked on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transaction Type */}
              <div className="space-y-1.5">
                <div className="h-5 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </label>
                </div>
                <div className="h-12 grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("type", "EXPENSE");
                      setValue("category", "");
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg font-semibold text-xs transition-all duration-200",
                      watchedType === "EXPENSE"
                        ? "bg-white text-rose-600 shadow-sm border border-rose-200/70"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Expense</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setValue("type", "INCOME");
                      setValue("category", "");
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg font-semibold text-xs transition-all duration-200",
                      watchedType === "INCOME"
                        ? "bg-white text-emerald-600 shadow-sm border border-emerald-200/70"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Income</span>
                  </button>
                </div>
                {errors.type && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <div className="h-5 flex items-center justify-between">
                  <label
                    htmlFor="amount"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Amount
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">
                    INR (₹)
                  </span>
                </div>
                <div className="h-12 relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <span className="text-lg font-bold text-slate-400 select-none">
                    ₹
                  </span>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-transparent pl-2 text-lg sm:text-xl font-bold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none"
                    {...register("amount")}
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Account & Category Grid (Identical h-5 label baselines and h-12 inputs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Field */}
              <div className="space-y-1.5">
                <div className="h-5 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </label>
                </div>

                <Controller
                  name="accountId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                        <div className="flex items-center gap-2 truncate">
                          <Wallet className="h-4 w-4 text-slate-400 shrink-0" />
                          <SelectValue placeholder="Select account" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {accounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            className="rounded-lg"
                          >
                            <div className="flex items-center justify-between w-full gap-3">
                              <span className="font-medium text-slate-900">
                                {account.name}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
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
                  <p className="text-xs font-medium text-rose-500">
                    {errors.accountId.message}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div className="space-y-1.5">
                <div className="h-5 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </label>
                </div>

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                        <div className="flex items-center gap-2 truncate">
                          <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                          <SelectValue placeholder="Select category" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 max-h-64">
                        {filteredCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="rounded-lg capitalize"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: category.color || "#6366f1",
                                }}
                              />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Date & Description Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Picker */}
              <div className="space-y-1.5">
                <div className="h-5 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Transaction Date
                  </label>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-12 w-full justify-start rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm font-normal transition-all hover:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
                        !watchedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                      {watchedDate ? (
                        format(watchedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-2xl border-slate-200 shadow-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={watchedDate}
                      onSelect={(date) => setValue("date", date || new Date())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-1.5" ref={suggestionsRef}>
                <div className="h-5 flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Description
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="description"
                    placeholder="e.g. Supermarket, Netflix, Salary"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    autoComplete="off"
                    {...register("description")}
                    onFocus={() => setShowSuggestions(true)}
                  />

                  {/* Small-sized autocomplete dropdown - only appears while typing matching notes */}
                  {showSuggestions &&
                    watchedDescription?.trim().length > 0 &&
                    filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-md border border-slate-200/90 overflow-hidden py-1 max-h-36 overflow-y-auto">
                        {filteredSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSuggestion(s);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/80 flex items-center justify-between text-xs text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <span className="truncate font-medium">
                              {s.description}
                            </span>
                            {s.category && (
                              <span className="text-[10px] text-slate-400 capitalize shrink-0 ml-2">
                                {s.category.replace(/-/g, " ")}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {errors.description && (
                  <p className="text-xs font-medium text-rose-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Recurring Transaction Card */}
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
                      Repeat this entry automatically on a regular schedule
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

              {/* Recurring Interval Dropdown */}
              {isRecurring && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="h-5 flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Recurring Frequency
                    </label>
                  </div>
                  <Controller
                    name="recurringInterval"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white px-3.5 text-sm">
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                          <SelectItem value="DAILY" className="rounded-lg">
                            Daily
                          </SelectItem>
                          <SelectItem value="WEEKLY" className="rounded-lg">
                            Weekly
                          </SelectItem>
                          <SelectItem value="MONTHLY" className="rounded-lg">
                            Monthly
                          </SelectItem>
                          <SelectItem value="YEARLY" className="rounded-lg">
                            Yearly
                          </SelectItem>
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

            {/* Action Buttons: Desktop Inline, Mobile Full-Width */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-36 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-all"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={transactionLoading}
                className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] text-sm"
              >
                {transactionLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editMode ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {editMode ? "Update Transaction" : "Save Transaction"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Right Column: AI Scanner & Real-Time Receipt Preview */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          {/* Desktop AI Receipt Scanner */}
          {!editMode && (
            <div className="hidden lg:block">
              <ReceiptScanner onScanComplete={handleScanComplete} />
            </div>
          )}

          {/* Live Transaction Preview Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Preview
                </span>
              </div>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                  watchedType === "EXPENSE"
                    ? "bg-rose-50 text-rose-700 border border-rose-200/70"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                )}
              >
                {watchedType}
              </span>
            </div>

            {/* Big Amount Display */}
            <div className="text-center py-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-0.5">
                Transaction Value
              </span>
              <div
                className={cn(
                  "text-3xl font-extrabold tracking-tight",
                  watchedType === "EXPENSE"
                    ? "text-rose-600"
                    : "text-emerald-600"
                )}
              >
                {watchedType === "EXPENSE" ? "-" : "+"}₹
                {watchedAmount
                  ? parseFloat(watchedAmount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Account</span>
                <span className="font-semibold text-slate-800">
                  {selectedAccount?.name || "Not selected"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Category</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedCategory?.name || "Not selected"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Date</span>
                <span className="font-semibold text-slate-800">
                  {watchedDate ? format(watchedDate, "PPP") : "Today"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                  {watchedDescription || "—"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Frequency</span>
                <span className="font-semibold text-slate-800">
                  {isRecurring ? "Recurring Schedule" : "One-time"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTransactionForm;
