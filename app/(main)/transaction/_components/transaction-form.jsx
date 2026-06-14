"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Wallet, Tag, Repeat } from "lucide-react";
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

  const { loading, fn, data } = useFetch(
    editMode ? updateTransaction : createTransaction,
  );

  const defaultValues = useMemo(() => {
    if (editMode && initialData) {
      return {
        type: initialData.type,
        amount: initialData.amount.toString(),
        description: initialData.description,
        accountId: initialData.accountId,
        category: initialData.category,
        date: new Date(initialData.date),
        isRecurring: initialData.isRecurring,
        ...(initialData.recurringInterval && {
          recurringInterval: initialData.recurringInterval,
        }),
      };
    }

    return {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: accounts.find((a) => a.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
    };
  }, [editMode, initialData, accounts]);

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
    defaultValues,
  });

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  // Filter categories (optimized)
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  // Submit (stable)
  const onSubmit = useCallback(
    async (data) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
      };

      if (editMode) {
        await fn(editId, payload);
      } else {
        await fn(payload);
      }
    },
    [fn, editMode, editId],
  );

  // Scan handler (stable)
  const handleScanComplete = useCallback(
    (scannedData) => {
      if (!scannedData) return;

      setValue("amount", scannedData.amount?.toString() || "");
      setValue("date", new Date(scannedData.date));

      if (scannedData.description)
        setValue("description", scannedData.description);

      if (scannedData.category) setValue("category", scannedData.category);

      toast.success("Receipt scanned successfully");
    },
    [setValue],
  );

  // Set default date once
  useEffect(() => {
    if (!editMode && !initialData) {
      setValue("date", new Date());
    }
  }, [editMode, initialData, setValue]);

  // Success handler
  useEffect(() => {
    if (!data?.success || loading) return;

    toast.success(
      editMode
        ? "Transaction updated successfully"
        : "Transaction created successfully",
    );

    reset();
    router.push(`/account/${data.data.accountId}`);
  }, [data, loading, editMode, reset, router]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md w-full max-w-3xl mx-auto"
    >
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Type</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <p className="text-xs text-red-500">{errors.type.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Amount</label>
          <Input type="number" step="0.01" {...register("amount")} />
        </div>

        {/* Account */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Account</label>
          <Controller
            name="accountId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <SelectValue placeholder="Select account" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                  <CreateAccountDrawer>
                    <Button variant="ghost" className="w-full">
                      Create Account
                    </Button>
                  </CreateAccountDrawer>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <SelectValue placeholder="Select category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(!date && "text-muted-foreground")}
              >
                {date ? format(date, "PPP") : "Pick a date"}
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setValue("date", d)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-1">Description</label>
          <Input {...register("description")} />
        </div>
      </div>

      {/* Recurring */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <Repeat className="h-5 w-5" />
          <div>
            <p className="font-medium">Recurring</p>
            <p className="text-sm text-muted-foreground">
              Set repeating transaction
            </p>
          </div>
        </div>

        <Controller
          name="isRecurring"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      {isRecurring && (
        <Controller
          name="recurringInterval"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
