"use client";

import { useState, useEffect } from "react";
import { updateDefaultAccount, updateAccountName } from "@/actions/accounts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useFetch from "@/hooks/use-fetch";
import { ArrowDownRight, ArrowUpRight, Pencil, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;
  const router = useRouter();

  // State for editing account name
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [accountName, setAccountName] = useState(name);
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setAccountName(name);
  }, [name]);

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error: defaultError,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount, updateDefaultLoading]);

  useEffect(() => {
    if (defaultError) {
      toast.error(defaultError.message || "Failed to update default account");
    }
  }, [defaultError]);

  const handleOpenEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmed = accountName.trim();
    if (!trimmed) {
      toast.error("Account name cannot be empty");
      return;
    }

    try {
      setIsSavingName(true);
      const res = await updateAccountName(id, trimmed);

      if (res.success) {
        toast.success("Account name updated successfully");
        setIsEditDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update account name");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update account name");
    } finally {
      setIsSavingName(false);
    }
  };

  const numBalance = parseFloat(balance) || 0;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group relative border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
        <Link href={`/account/${id}`} prefetch={true} className="block">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pr-24">
            <div className="flex items-center gap-1.5 min-w-0">
              <CardTitle className="text-sm font-semibold capitalize truncate text-slate-800 dark:text-slate-100">
                {name}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="pt-1">
            <div
              className={`text-2xl font-bold tracking-tight ${
                numBalance < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {numBalance < 0 ? "-₹" : "₹"}
              {Math.abs(numBalance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>

          <CardFooter className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              Income
            </div>
            <div className="flex items-center font-medium text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
              Expense
            </div>
          </CardFooter>
        </Link>

        {/* Action Controls: Edit Name Button & Default Switch */}
        <div
          className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Edit Name Button with Icon */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleOpenEdit}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
            title="Edit account name"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Default Account Switch */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Switch
                    checked={isDefault}
                    onCheckedChange={() => handleDefaultChange({ preventDefault: () => {} })}
                    disabled={updateDefaultLoading}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">
                  {isDefault ? "Default Account" : "Click to set as default"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>

      {/* Edit Account Name Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Wallet className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Account Name
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-1">
              Update the display name for this account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveName} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label
                htmlFor="account-name-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                Account Name
              </label>
              <Input
                id="account-name-input"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Salary Account, Emergency Fund"
                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 text-sm transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
                disabled={isSavingName}
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSavingName}
                className="rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingName || !accountName.trim()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                {isSavingName ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountCard;
