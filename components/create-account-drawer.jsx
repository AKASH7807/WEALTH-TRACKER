"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Wallet, CheckCircle2 } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";
import { useMediaQuery } from "@/hooks/use-media-query";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, createAccountLoading, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Account Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="text-xs font-semibold uppercase tracking-wider text-slate-600"
        >
          Account Name
        </label>
        <div className="relative">
          <Input
            id="name"
            placeholder="e.g. Salary Account, Emergency Fund"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-xs font-medium text-rose-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Account Type & Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account Type */}
        <div className="space-y-1.5">
          <label
            htmlFor="type"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            Account Type
          </label>
          <Select
            onValueChange={(value) => setValue("type", value)}
            defaultValue={watch("type")}
          >
            <SelectTrigger
              id="type"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="CURRENT" className="rounded-lg">
                Current
              </SelectItem>
              <SelectItem value="SAVINGS" className="rounded-lg">
                Savings
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-xs font-medium text-rose-500">
              {errors.type.message}
            </p>
          )}
        </div>

        {/* Initial Balance */}
        <div className="space-y-1.5">
          <label
            htmlFor="balance"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            Initial Balance (₹)
          </label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            {...register("balance")}
          />
          {errors.balance && (
            <p className="text-xs font-medium text-rose-500">
              {errors.balance.message}
            </p>
          )}
        </div>
      </div>

      {/* Default Account Switch */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
        <div className="space-y-0.5 pr-4">
          <label
            htmlFor="isDefault"
            className="text-sm font-semibold text-slate-900 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            Set as Default Account
          </label>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automatically preselected for new transactions and budget tracking
          </p>
        </div>
        <Switch
          id="isDefault"
          checked={watch("isDefault")}
          onCheckedChange={(checked) => setValue("isDefault", checked)}
        />
      </div>

      {/* Action Buttons (Strictly in-viewport on both desktop and mobile) */}
      <div className="flex items-center gap-3 pt-3">
        {isDesktop ? (
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium"
            >
              Cancel
            </Button>
          </DialogClose>
        ) : (
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium"
            >
              Cancel
            </Button>
          </DrawerClose>
        )}

        <Button
          type="submit"
          disabled={createAccountLoading}
          className="h-11 flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98]"
        >
          {createAccountLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Create Account
            </span>
          )}
        </Button>
      </div>
    </form>
  );

  // Desktop View: Centered Modal / Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-md w-full rounded-2xl p-6 sm:p-7 bg-white shadow-2xl border border-slate-200/90">
          <DialogHeader className="mb-4 text-left">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Create New Account
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Add a new bank account or wallet to track finances
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile View: Bottom Sheet Drawer with Grab Handle & Safe Scroll
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh] bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl flex flex-col">
        {/* Grab Handle */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300 shrink-0" />

        <DrawerHeader className="text-left px-5 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <DrawerTitle className="text-lg font-bold text-slate-900">
                Create New Account
              </DrawerTitle>
              <DrawerDescription className="text-xs text-slate-500">
                Add a new account to track your wealth
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable form body safely within viewport */}
        <div className="overflow-y-auto px-5 pb-8 pt-2">
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateAccountDrawer;
