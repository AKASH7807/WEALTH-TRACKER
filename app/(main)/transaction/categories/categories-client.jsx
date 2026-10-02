"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  TrendingDown,
  TrendingUp,
  Tag,
  Search,
  Sparkles,
  AlertCircle,
  HelpCircle,
  FolderPlus,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon, AVAILABLE_ICONS } from "@/components/category-icon";
import {
  createCustomCategory,
  deleteCategory,
  restoreCategory,
  resetCategories,
} from "@/actions/categories";

const COLOR_PRESETS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#64748b", // slate-500
];

export function CategoriesClient({ initialCategories = [], initialHidden = [] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [hiddenCategories, setHiddenCategories] = useState(initialHidden);
  const [isPending, startTransition] = useTransition();

  // New Category Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [color, setColor] = useState("#6366f1");
  const [icon, setIcon] = useState("Tag");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search state
  const [filterType, setFilterType] = useState("ALL"); // 'ALL', 'EXPENSE', 'INCOME'
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesType =
        filterType === "ALL" || cat.type === filterType;
      const matchesSearch =
        !searchTerm ||
        cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [categories, filterType, searchTerm]);

  // Handle Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCustomCategory({
        name: name.trim(),
        type,
        color,
        icon,
      });

      if (res.success) {
        toast.success(res.message || `Category "${res.data.name}" added successfully!`);
        setName("");
        // Optimistically update
        setCategories((prev) => [res.data, ...prev.filter((c) => c.id !== res.data.id)]);
        // If it was in hidden, remove it
        setHiddenCategories((prev) => prev.filter((id) => id !== res.data.id));
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Failed to create category");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete / Remove Category
  const handleDeleteCategory = async (category) => {
    const isCustom = category.isCustom;
    const confirmMessage = isCustom
      ? `Are you sure you want to permanently delete custom category "${category.name}"?`
      : `Remove default category "${category.name}" from your active categories? (You can restore it anytime)`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await deleteCategory(category.id);
      if (res.success) {
        toast.success(res.message || `Category "${category.name}" removed`);
        // Optimistic UI update
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        if (!isCustom) {
          setHiddenCategories((prev) => [...prev, category.id]);
        }
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Failed to remove category");
      }
    } catch (err) {
      toast.error(err.message || "Failed to remove category");
    }
  };

  // Handle Restore Category
  const handleRestoreCategory = async (categoryId) => {
    try {
      const res = await restoreCategory(categoryId);
      if (res.success) {
        toast.success("Category restored!");
        setHiddenCategories((prev) => prev.filter((id) => id !== categoryId));
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Failed to restore category");
      }
    } catch (err) {
      toast.error(err.message || "Failed to restore category");
    }
  };

  // Handle Reset All Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm("Restore all default categories to active?")) return;
    try {
      const res = await resetCategories();
      if (res.success) {
        toast.success("All default categories restored!");
        setHiddenCategories([]);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to reset categories");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <Link
            href="/transaction/create"
            className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Add Transaction</span>
          </Link>
          <span>•</span>
          <Link
            href="/dashboard"
            className="hover:text-indigo-600 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
              <FolderPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Manage Categories
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Add custom categories and remove or restore categories for your transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/transaction/create">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Go to Transactions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Add Category Form (Left) & Categories List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create New Category Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50/70 to-violet-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" />
                Add New Category
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              <form onSubmit={handleAddCategory} className="space-y-4">
                {/* Category Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setType("EXPENSE")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all ${
                        type === "EXPENSE"
                          ? "bg-white text-rose-600 shadow-sm border border-rose-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span>Expense</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setType("INCOME")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-xs transition-all ${
                        type === "INCOME"
                          ? "bg-white text-emerald-600 shadow-sm border border-emerald-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Income</span>
                    </button>
                  </div>
                </div>

                {/* Category Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category Name
                  </label>
                  <Input
                    placeholder="e.g. Gym, Pet Food, Freelance, Subscriptions"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Color Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category Color
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {color}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setColor(preset)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                          color === preset
                            ? "ring-2 ring-offset-2 ring-indigo-600 scale-110 shadow-sm"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: preset }}
                        title={preset}
                      >
                        {color === preset && (
                          <Check className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>
                    ))}
                    {/* Custom Color Input */}
                    <div className="relative flex items-center">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-7 w-7 rounded-full border border-slate-300 cursor-pointer overflow-hidden p-0"
                        title="Pick custom color"
                      />
                    </div>
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category Icon
                    </label>
                    <span className="text-[11px] text-slate-400">{icon}</span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50/50">
                    {AVAILABLE_ICONS.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcon(item.name)}
                        className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                          icon === item.name
                            ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30"
                            : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
                        }`}
                        title={item.label}
                      >
                        <CategoryIcon name={item.name} className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Live Preview
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        <CategoryIcon name={icon} className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm text-slate-800 capitalize">
                        {name || "Category Name"}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        type === "EXPENSE"
                          ? "text-rose-600 border-rose-200 bg-rose-50"
                          : "text-emerald-600 border-emerald-200 bg-emerald-50"
                      }`}
                    >
                      {type}
                    </Badge>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20 transition-all text-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Adding Category...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Category
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Categories Management List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "ALL"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("EXPENSE")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "EXPENSE"
                    ? "bg-white text-rose-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Expense (
                {categories.filter((c) => c.type === "EXPENSE").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("INCOME")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "INCOME"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Income (
                {categories.filter((c) => c.type === "INCOME").length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 rounded-xl border-slate-200 text-xs focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
              <span>
                Showing {filteredCategories.length} categor
                {filteredCategories.length === 1 ? "y" : "ies"}
              </span>
              <span className="text-[11px] text-slate-400">
                Click trash icon to remove
              </span>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white space-y-2">
                <Tag className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-600">
                  No categories found matching your filter
                </p>
                <p className="text-xs text-slate-400">
                  Try searching for another name or add a new category using the form on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{
                          backgroundColor: category.color || "#6366f1",
                        }}
                      >
                        <CategoryIcon
                          name={category.icon}
                          className="h-4 w-4"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate capitalize">
                            {category.name}
                          </p>
                          {category.isCustom && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-400">
                          {category.type === "EXPENSE" ? "Expense" : "Income"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category)}
                      title={
                        category.isCustom
                          ? "Permanently delete custom category"
                          : "Remove category from active list"
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hidden / Removed Default Categories Section */}
          {hiddenCategories.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-semibold">
                    Removed Default Categories ({hiddenCategories.length})
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaults}
                  className="h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-100 rounded-lg"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Restore All
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {hiddenCategories.map((catId) => (
                  <div
                    key={catId}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-medium text-slate-700 shadow-xs"
                  >
                    <span className="capitalize">{catId.replace(/-/g, " ")}</span>
                    <button
                      type="button"
                      onClick={() => handleRestoreCategory(catId)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoriesClient;
