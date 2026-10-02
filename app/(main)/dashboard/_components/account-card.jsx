"use client";

import { useState, useEffect } from "react";
import { updateDefaultAccount, updateAccountName } from "@/actions/accounts";
import { Card } from "@/components/ui/card";
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
import { Pencil, Loader2, Wallet, Landmark, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Icon based on account type
  const getAccountIcon = () => {
    const t = type.toLowerCase();
    if (t.includes("credit")) return <CreditCard className="h-4 w-4" />;
    if (t.includes("saving") || t.includes("current")) return <Landmark className="h-4 w-4" />;
    return <Wallet className="h-4 w-4" />;
  };

  return (
    <>
      <Card className="hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800 transition-all group relative border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs">
        <Link href={`/account/${id}`} prefetch={true} className="block p-5">
          <div className="flex items-center justify-between pb-2 pr-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                {getAccountIcon()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold capitalize truncate text-slate-900 dark:text-white">
                  {name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {type.toLowerCase()} account
                  </span>
                  {isDefault && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Net Balance
            </span>
            <div
              className={cn(
                "text-2xl font-black tracking-tight mt-0.5",
                numBalance < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-white"
              )}
            >
              {numBalance < 0 ? "-₹" : "₹"}
              {Math.abs(numBalance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-muted-foreground text-[11px] font-medium">
              {account._count?.transactions ?? 0} transactions
            </span>
            <span className="text-purple-600 dark:text-purple-400 text-xs font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>View Activity</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* Action Controls: Edit Name Button & Default Switch */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 z-10"
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
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
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
                    className="data-[state=checked]:bg-purple-600"
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
          className="max-w-md p-6 rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
              <Wallet className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Account Name
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-0.5">
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
                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 text-sm transition-all focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
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
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium"
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
