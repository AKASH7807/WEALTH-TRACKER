"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { getUserCategories } from "@/actions/categories";
import useFetch from "@/hooks/use-fetch";
import { categoryColors, defaultCategories } from "@/data/categories";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
  Trash2,
  Pencil,
  RotateCcw,
  Landmark,
  MoreVertical,
  X,
  RefreshCw,
  Clock,
  List,
  Table as TableIcon,
  Check,
  AlertTriangle,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

// Format currency in Indian numbering (e.g., 3,500 or 45 or 3,500.50)
function formatINR(amount) {
  const num = Math.abs(Number(amount) || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Render modern mild light-color badge pill
function renderCategoryBadge(category, info = null) {
  if (!category && !info) return null;
  const rawColor = info?.color || categoryColors[category] || "#6366f1";
  const name = info?.name || (category ? category.replace(/-/g, " ") : "Uncategorized");

  return (
    <span
      style={{
        backgroundColor: `${rawColor}15`, // gentle, mild light tint
        color: rawColor,
        borderColor: `${rawColor}30`,
      }}
      className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border capitalize tracking-tight shrink-0 select-none shadow-2xs leading-none"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: rawColor }}
      />
      <span className="truncate max-w-[95px] sm:max-w-[150px]">{name}</span>
    </span>
  );
}

// Generate avatar matching the neo-banking screenshot
function renderTransactionAvatar(transaction) {
  const desc = (transaction.description || "").trim();
  const lower = desc.toLowerCase();

  // Special "slice" styling from screenshot
  if (lower === "slice") {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-[10px] sm:text-xs tracking-tight shadow-xs shrink-0 select-none">
        slice
      </div>
    );
  }

  // Special "bank transfer" styling from screenshot
  if (lower.includes("bank transfer") || lower.includes("transfer")) {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0 select-none">
        <Landmark className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </div>
    );
  }

  // Special "repayment" styling from screenshot
  if (lower.includes("repayment") || transaction.isRecurring) {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#84cc16] text-white flex items-center justify-center shadow-xs shrink-0 select-none">
        <RotateCcw className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </div>
    );
  }

  // Deterministic pastel palette for recipient initials (matching screenshot's R, H, A)
  const palettes = [
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200", // R
    "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",  // H
    "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",  // A
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  ];

  const firstChar = desc.charAt(0).toUpperCase() || (transaction.type === "INCOME" ? "I" : "E");
  const charCode = firstChar.charCodeAt(0) || 0;
  const palette = palettes[charCode % palettes.length];

  return (
    <div
      className={cn(
        "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-xs shrink-0 select-none",
        palette
      )}
    >
      {firstChar}
    </div>
  );
}

export function TransactionTable({
  transactions = [],
  categories = [],
  accountName = "",
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // View state: 'activity' (default) or 'table'
  const [viewMode, setViewMode] = useState("activity");

  // Selection mode & selected IDs
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Action Dialog state (for mobile hold / desktop click)
  const [actionTransaction, setActionTransaction] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Long press timer refs for mobile
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [categoryList, setCategoryList] = useState(categories);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryList(categories);
    } else {
      getUserCategories()
        .then((res) => {
          if (res?.success && res?.data) {
            setCategoryList(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load categories in TransactionTable:", err);
        });
    }
  }, [categories]);

  // Build a fast lookup map for all categories (default + custom + transaction-embedded)
  const categoryMap = useMemo(() => {
    const map = new Map();

    // 1. Seed with default categories
    defaultCategories.forEach((cat) => {
      map.set(cat.id, {
        name: cat.name,
        color: cat.color || "#6366f1",
        icon: cat.icon || "Tag",
      });
    });

    // 2. Add / override with custom categories & active categories from categoryList
    categoryList.forEach((cat) => {
      map.set(cat.id, {
        name: cat.name,
        color: cat.color || "#6366f1",
        icon: cat.icon || "Tag",
      });
    });

    // 3. Add any pre-resolved category details embedded directly in transactions
    transactions.forEach((t) => {
      if (t.category && t.categoryName) {
        if (!map.has(t.category) || map.get(t.category).name === t.category) {
          map.set(t.category, {
            name: t.categoryName,
            color: t.categoryColor || "#6366f1",
            icon: t.categoryIcon || "Tag",
          });
        }
      }
    });

    return map;
  }, [categoryList, transactions]);

  const getCategoryInfo = useMemo(() => {
    return (categoryId, tx = null) => {
      if (!categoryId) {
        return { name: "Uncategorized", color: "#6366f1", icon: "Tag" };
      }
      if (tx?.categoryName) {
        return {
          name: tx.categoryName,
          color: tx.categoryColor || categoryMap.get(categoryId)?.color || "#6366f1",
          icon: tx.categoryIcon || "Tag",
        };
      }
      const found = categoryMap.get(categoryId);
      if (found) {
        return found;
      }
      // Check if categoryId itself matches a category name (case-insensitive)
      for (const [key, val] of categoryMap.entries()) {
        if (val.name.toLowerCase() === categoryId.toLowerCase()) {
          return val;
        }
      }
      return {
        name: categoryId.replace(/-/g, " "),
        color: categoryColors[categoryId] || "#6366f1",
        icon: "Tag",
      };
    };
  }, [categoryMap]);

  // Unique categories in transactions, sorted by their resolved display name
  const availableCategories = useMemo(() => {
    const cats = transactions.map((t) => t.category).filter(Boolean);
    const unique = Array.from(new Set(cats));
    return unique.sort((a, b) => {
      const nameA = getCategoryInfo(a).name;
      const nameB = getCategoryInfo(b).name;
      return nameA.localeCompare(nameB);
    });
  }, [transactions, getCategoryInfo]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter && typeFilter !== "ALL") count++;
    if (categoryFilter && categoryFilter !== "ALL") count++;
    if (recurringFilter && recurringFilter !== "ALL") count++;
    return count;
  }, [typeFilter, categoryFilter, recurringFilter]);

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((t) => {
        const descMatch = t.description?.toLowerCase().includes(searchLower);
        const catInfo = getCategoryInfo(t.category, t);
        const catMatch = catInfo.name.toLowerCase().includes(searchLower);
        return descMatch || catMatch;
      });
    }

    // Type filter
    if (typeFilter && typeFilter !== "ALL") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter && categoryFilter !== "ALL") {
      result = result.filter(
        (t) => t.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Recurring filter
    if (recurringFilter && recurringFilter !== "ALL") {
      result = result.filter((t) => {
        if (recurringFilter === "recurring") return t.isRecurring;
        return !t.isRecurring;
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "category": {
          const nameA = getCategoryInfo(a.category, a).name;
          const nameB = getCategoryInfo(b.category, b).name;
          comparison = nameA.localeCompare(nameB);
          break;
        }
        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    recurringFilter,
    sortConfig,
    getCategoryInfo,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTransactions, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  // Bulk delete hook
  const { loading: deleteLoading, fn: deleteFn, data: deleted } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transaction${
          selectedIds.length > 1 ? "s" : ""
        }?`
      )
    )
      return;

    await deleteFn(selectedIds);
    setSelectedIds([]);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transaction(s) deleted successfully");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  // Mobile Hold / Long Press handlers
  const handleTouchStart = (transaction, e) => {
    if (isSelectMode) return;
    isLongPressRef.current = false;
    if (e.touches && e.touches[0]) {
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        try {
          window.navigator.vibrate(40);
        } catch (err) {}
      }
      setConfirmDelete(false);
      setActionTransaction(transaction);
    }, 500);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
      // Cancel long-press if user moves finger more than 10px (scrolling)
      if (dx > 10 || dy > 10) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRowClick = (transaction) => {
    if (isSelectMode) {
      handleSelect(transaction.id);
    } else {
      setConfirmDelete(false);
      setActionTransaction(transaction);
    }
  };

  // CSV Export
  const handleDownloadCSV = () => {
    try {
      const dataToExport = filteredAndSortedTransactions.length > 0 ? filteredAndSortedTransactions : transactions;
      if (!dataToExport || dataToExport.length === 0) {
        toast.error("No transactions to export");
        return;
      }

      const headers = [
        "Date",
        "Description",
        "Category",
        "Type",
        "Amount",
        "Recurring",
        "Next Recurring Date",
      ];

      const rows = dataToExport.map((t) => [
        format(new Date(t.date), "PPP"),
        t.description || "",
        getCategoryInfo(t.category, t).name || "",
        t.type || "",
        (t.type === "EXPENSE" ? "-" : "") + Number(t.amount).toFixed(2),
        t.isRecurring ? "Yes" : "No",
        t.isRecurring && t.nextRecurringDate ? format(new Date(t.nextRecurringDate), "PPP") : "",
      ]);

      const escapeCsv = (val) => `"${String(val).replace(/"/g, '""')}"`;
      const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\r\n");

      const bom = "\uFEFF";
      const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const now = new Date();
      a.download = `transactions_${now.toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV export downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export transactions");
    }
  };

  // Professional Executive PDF Export
  const handleDownloadPDF = async () => {
    try {
      const dataToExport =
        filteredAndSortedTransactions.length > 0
          ? filteredAndSortedTransactions
          : transactions;
      if (!dataToExport || dataToExport.length === 0) {
        toast.error("No transactions to export");
        return;
      }

      setIsExportingPDF(true);
      const { jsPDF } = await import("jspdf");
      await import("jspdf-autotable");

      const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
      const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
      const margin = 36;
      const contentWidth = pageWidth - margin * 2; // 523.28 pt

      // Calculate financial aggregates
      const totalIncome = dataToExport
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const totalExpenses = dataToExport
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const netCashFlow = totalIncome - totalExpenses;

      // Extract transaction dates for statement period
      const validDates = dataToExport
        .map((t) => (t.date ? new Date(t.date).getTime() : null))
        .filter(Boolean);
      const minDate = validDates.length ? new Date(Math.min(...validDates)) : null;
      const maxDate = validDates.length ? new Date(Math.max(...validDates)) : null;
      const periodString =
        minDate && maxDate
          ? `${format(minDate, "dd MMM yyyy")} – ${format(maxDate, "dd MMM yyyy")}`
          : "All Activity";

      // 1. Top Brand Accent Stripe
      doc.setFillColor(79, 70, 229); // Indigo #4f46e5
      doc.rect(0, 0, pageWidth, 4, "F");

      // 2. Executive Statement Header
      let currentY = 32;

      // Left: Brand & Statement Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("WEALTH TRACKER", margin, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(
        accountName
          ? `ACCOUNT STATEMENT · ${accountName.toUpperCase()}`
          : "TRANSACTION ACTIVITY STATEMENT",
        margin,
        currentY + 12
      );

      // Right: Metadata Block
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const metaGenerated = `Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`;
      const metaPeriod = `Period: ${periodString}`;
      const metaRecords = `Total Records: ${dataToExport.length} transactions`;

      doc.text(metaGenerated, pageWidth - margin, currentY - 2, { align: "right" });
      doc.text(metaPeriod, pageWidth - margin, currentY + 9, { align: "right" });
      doc.text(metaRecords, pageWidth - margin, currentY + 20, { align: "right" });

      currentY += 28;

      // Header Divider Line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.75);
      doc.line(margin, currentY, pageWidth - margin, currentY);

      currentY += 10;

      // 3. Executive KPI Summary Cards Row
      const cardGap = 8;
      const cardWidth = (contentWidth - cardGap * 2) / 3;
      const cardHeight = 36;

      // Card 1: Total Inflow (Income)
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(187, 247, 208); // emerald-200
      doc.roundedRect(margin, currentY, cardWidth, cardHeight, 4, 4, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("TOTAL INFLOW (INCOME)", margin + 8, currentY + 12);

      doc.setFontSize(10.5);
      doc.setTextColor(4, 120, 87); // emerald-700
      doc.text(`+INR ${formatINR(totalIncome)}`, margin + 8, currentY + 27);

      // Card 2: Total Outflow (Expenses)
      const card2X = margin + cardWidth + cardGap;
      doc.setFillColor(255, 241, 242); // rose-50
      doc.setDrawColor(254, 205, 211); // rose-200
      doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 4, 4, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text("TOTAL OUTFLOW (EXPENSES)", card2X + 8, currentY + 12);

      doc.setFontSize(10.5);
      doc.setTextColor(190, 18, 60); // rose-700
      doc.text(`-INR ${formatINR(totalExpenses)}`, card2X + 8, currentY + 27);

      // Card 3: Net Cash Flow
      const card3X = card2X + cardWidth + cardGap;
      const isNetPositive = netCashFlow >= 0;
      if (isNetPositive) {
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(187, 247, 208);
      } else {
        doc.setFillColor(255, 241, 242);
        doc.setDrawColor(254, 205, 211);
      }
      doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 4, 4, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      if (isNetPositive) {
        doc.setTextColor(5, 150, 105);
      } else {
        doc.setTextColor(225, 29, 72);
      }
      doc.text("NET CASH FLOW", card3X + 8, currentY + 12);

      doc.setFontSize(10.5);
      if (isNetPositive) {
        doc.setTextColor(4, 120, 87);
      } else {
        doc.setTextColor(190, 18, 60);
      }
      doc.text(
        `${isNetPositive ? "+" : "-"}INR ${formatINR(Math.abs(netCashFlow))}`,
        card3X + 8,
        currentY + 27
      );

      currentY += cardHeight + 14;

      // Table Section Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(`ITEMIZED TRANSACTIONS (${dataToExport.length} RECORDS)`, margin, currentY);

      currentY += 5;

      // 4. Itemized Ledger Table
      const cols = [
        "Date",
        "Description",
        "Category",
        "Type",
        "Amount",
        "Frequency",
        "Next Due",
      ];

      const rows = dataToExport.map((t) => [
        t.date ? format(new Date(t.date), "dd MMM yyyy") : "—",
        (t.description || "Untitled Transaction").trim(),
        getCategoryInfo(t.category, t).name || "General",
        t.type || "EXPENSE",
        `${t.type === "EXPENSE" ? "-" : "+"}INR ${formatINR(t.amount)}`,
        t.isRecurring
          ? RECURRING_INTERVALS[t.recurringInterval] || "Recurring"
          : "One-time",
        t.isRecurring && t.nextRecurringDate
          ? format(new Date(t.nextRecurringDate), "dd MMM yy")
          : "—",
      ]);

      doc.autoTable({
        startY: currentY,
        head: [cols],
        body: rows,
        theme: "striped",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: { top: 4.5, right: 4.5, bottom: 4.5, left: 4.5 },
          valign: "middle",
          overflow: "linebreak",
          lineColor: [241, 245, 249],
          lineWidth: 0.5,
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [30, 41, 59], // Slate-800
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: { top: 5.5, right: 4.5, bottom: 5.5, left: 4.5 },
          valign: "middle",
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Slate-50
        },
        columnStyles: {
          0: { cellWidth: 68, halign: "left" },   // Date: "10 Oct 2026" never wraps
          1: { cellWidth: 147, halign: "left" },  // Description: generous space
          2: { cellWidth: 84, halign: "left" },   // Category: resolved name
          3: { cellWidth: 50, halign: "center" }, // Type: Centered
          4: { cellWidth: 74, halign: "right" },  // Amount: Right-aligned
          5: { cellWidth: 50, halign: "center" }, // Frequency: Centered
          6: { cellWidth: 50, halign: "center" }, // Next Due: Centered
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            // Type column
            if (data.column.index === 3) {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.fontSize = 7;
              if (data.cell.raw === "INCOME") {
                data.cell.styles.textColor = [5, 150, 105]; // emerald-600
              } else {
                data.cell.styles.textColor = [225, 29, 72]; // rose-600
              }
            }
            // Amount column
            if (data.column.index === 4) {
              data.cell.styles.fontStyle = "bold";
              if (typeof data.cell.raw === "string" && data.cell.raw.startsWith("-")) {
                data.cell.styles.textColor = [225, 29, 72]; // rose-600
              } else if (typeof data.cell.raw === "string" && data.cell.raw.startsWith("+")) {
                data.cell.styles.textColor = [5, 150, 105]; // emerald-600
              }
            }
            // Frequency column
            if (data.column.index === 5) {
              if (data.cell.raw && data.cell.raw !== "One-time") {
                data.cell.styles.textColor = [124, 58, 237]; // violet-600
                data.cell.styles.fontStyle = "bold";
              } else {
                data.cell.styles.textColor = [100, 116, 139]; // slate-500
              }
            }
          }
        },
        margin: { left: margin, right: margin, bottom: 35 },
        didDrawPage: (data) => {
          // Running header on page 2 and onwards
          if (data.pageNumber > 1) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(
              accountName
                ? `Wealth Tracker · ${accountName.toUpperCase()} · Activity Statement`
                : "Wealth Tracker · Transaction Activity Statement",
              margin,
              22
            );
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(margin, 26, pageWidth - margin, 26);
          }
        },
      });

      // 5. Professional Footer on All Pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 24, pageWidth - margin, pageHeight - 24);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("Wealth Tracker · Confidential Financial Statement", margin, pageHeight - 14);

        const pageText = `Page ${i} of ${totalPages}`;
        doc.text(pageText, pageWidth - margin, pageHeight - 14, { align: "right" });
      }

      const fileSafeName = (accountName || "transactions")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const now = new Date().toISOString().slice(0, 10);
      doc.save(`${fileSafeName}_statement_${now}.pdf`);
      toast.success("Professional PDF statement downloaded successfully");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-2 rounded-full" width={"100%"} color="#9333ea" />
      )}

      {/* Top Activity Header matching the screenshot */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Activity
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
            {filteredAndSortedTransactions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Select Mode Toggle */}
          <Button
            variant={isSelectMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
            className="rounded-full h-8 sm:h-9 px-3 text-xs font-semibold"
          >
            {isSelectMode ? "Cancel" : "Select"}
          </Button>

          {/* Export Button (Opens format selection modal: CSV or PDF) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            className="rounded-full h-8 sm:h-9 px-3 gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs active:scale-95 transition-all"
            title="Export transactions"
          >
            <Download className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Export</span>
          </Button>

          {/* View Mode Toggle: Activity vs Table */}
          <div className="hidden md:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("activity")}
              className={cn(
                "p-1.5 rounded-full text-xs font-medium transition-all",
                viewMode === "activity"
                  ? "bg-white dark:bg-slate-900 text-purple-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
              title="Feed View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-full text-xs font-medium transition-all",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-purple-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar + Circular Filter Button (Matching Screenshot) */}
      <div className="flex items-center gap-2.5">
        {/* Pill-shaped search bar with purple accent border */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 pl-10 pr-9 rounded-full border-2 border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-purple-600 text-sm bg-white dark:bg-slate-900 placeholder:text-slate-400 text-slate-900 dark:text-slate-100 shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Circular Filter Button */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "h-11 w-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs relative shrink-0",
                activeFilterCount > 0 && "border-purple-500 text-purple-600 bg-purple-50/40 dark:bg-purple-950/40"
              )}
              title="Filter transactions"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 sm:w-88 p-4 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Filter & Sort
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    Reset all
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {["ALL", "INCOME", "EXPENSE"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTypeFilter(type === "ALL" ? "" : type);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "py-1.5 text-xs font-medium rounded-lg capitalize transition-all",
                        (type === "ALL" && !typeFilter) || typeFilter === type
                          ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      )}
                    >
                      {type === "ALL" ? "All" : type.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Category
                </label>
                <Select
                  value={categoryFilter || "ALL"}
                  onValueChange={(val) => {
                    setCategoryFilter(val === "ALL" ? "" : val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56 rounded-xl">
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {availableCategories.map((cat) => {
                      const catInfo = getCategoryInfo(cat);
                      return (
                        <SelectItem key={cat} value={cat} className="capitalize text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: catInfo.color }}
                            />
                            <span>{catInfo.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Recurring Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Frequency
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {[
                    { id: "ALL", label: "All" },
                    { id: "recurring", label: "Recurring" },
                    { id: "non-recurring", label: "One-time" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setRecurringFilter(item.id === "ALL" ? "" : item.id);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "py-1.5 text-xs font-medium rounded-lg transition-all",
                        (item.id === "ALL" && !recurringFilter) || recurringFilter === item.id
                          ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Configuration */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Sort By
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { field: "date", label: "Date" },
                    { field: "amount", label: "Amount" },
                    { field: "category", label: "Category" },
                  ].map((item) => {
                    const isSelected = sortConfig.field === item.field;
                    return (
                      <button
                        key={item.field}
                        type="button"
                        onClick={() => handleSort(item.field)}
                        className={cn(
                          "py-1.5 px-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1 transition-all",
                          isSelected
                            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        )}
                      >
                        <span>{item.label}</span>
                        {isSelected && (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Chips */}
      {(typeFilter || categoryFilter || recurringFilter || searchTerm) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-normal">
              "{searchTerm}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
          {typeFilter && (
            <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-normal capitalize">
              Type: {typeFilter.toLowerCase()}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setTypeFilter("")} />
            </Badge>
          )}
          {categoryFilter && (
            <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-normal capitalize">
              Category: {getCategoryInfo(categoryFilter).name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("")} />
            </Badge>
          )}
          {recurringFilter && (
            <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-normal">
              {recurringFilter === "recurring" ? "Recurring" : "One-time"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setRecurringFilter("")} />
            </Badge>
          )}
          <button
            onClick={handleClearFilters}
            className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Bulk Action Banner when in Select Mode */}
      {isSelectMode && (
        <div className="flex items-center justify-between p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-2xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                selectedIds.length === paginatedTransactions.length &&
                paginatedTransactions.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select All on this page ({selectedIds.length} selected)
            </span>
          </div>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="rounded-full h-8 px-3 text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}
        </div>
      )}

      {/* VIEW 1: Activity Feed (Default & matches Screenshot) */}
      {viewMode === "activity" ? (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {paginatedTransactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <p className="text-sm font-medium">No transactions found</p>
              {(searchTerm || typeFilter || categoryFilter || recurringFilter) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="rounded-full">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            paginatedTransactions.map((transaction) => {
              const isIncome = transaction.type === "INCOME";
              const isSelected = selectedIds.includes(transaction.id);

              return (
                <div
                  key={transaction.id}
                  onTouchStart={(e) => handleTouchStart(transaction, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setConfirmDelete(false);
                    setActionTransaction(transaction);
                  }}
                  onClick={() => handleRowClick(transaction)}
                  className={cn(
                    "flex items-center justify-between p-3.5 sm:p-4 transition-colors cursor-pointer select-none active:bg-slate-50 dark:active:bg-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                    isSelected && "bg-purple-50/60 dark:bg-purple-950/30"
                  )}
                >
                  {/* Left: Avatar + Title + Subtitle */}
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    {/* Checkbox if in Select Mode */}
                    {isSelectMode && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelect(transaction.id)}
                        />
                      </div>
                    )}

                    {/* Circular Avatar */}
                    {renderTransactionAvatar(transaction)}

                    {/* Details: Title & Subtitle */}
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug truncate">
                        {transaction.description || "Untitled Transaction"}
                      </div>

                      {/* Subtitle: Date, with category label in new line on mobile */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
                          {format(new Date(transaction.date), "d MMM ''yy")}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {renderCategoryBadge(
                            transaction.category,
                            getCategoryInfo(transaction.category, transaction)
                          )}

                          {/* Recurring badge if recurring */}
                          {transaction.isRecurring && (
                            <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-1.5 sm:px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] border border-purple-200/50 dark:border-purple-800/50">
                              <RefreshCw className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                              <span>
                                {RECURRING_INTERVALS[transaction.recurringInterval] || "Recurring"}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action dots */}
                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <div className="text-right">
                      <div
                        className={cn(
                          "font-bold text-base sm:text-lg tracking-tight",
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {isIncome ? "+" : "-"}₹{formatINR(transaction.amount)}
                      </div>
                    </div>

                    {/* 3-dots action trigger (opens Action Dialog) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(false);
                        setActionTransaction(transaction);
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* VIEW 2: Desktop Spreadsheet Table View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableHead className="w-[45px]">
                  <Checkbox
                    checked={
                      selectedIds.length === paginatedTransactions.length &&
                      paginatedTransactions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.field === "date" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead
                  className="cursor-pointer font-bold"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.field === "category" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-bold text-right"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.field === "amount" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="font-bold">Recurring</TableHead>
                <TableHead className="w-[45px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => {
                  const isIncome = transaction.type === "INCOME";
                  return (
                    <TableRow key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(transaction.id)}
                          onCheckedChange={() => handleSelect(transaction.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {format(new Date(transaction.date), "d MMM ''yy")}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        {renderCategoryBadge(
                          transaction.category,
                          getCategoryInfo(transaction.category, transaction)
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-bold",
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {isIncome ? "+" : "-"}₹{formatINR(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {transaction.isRecurring ? (
                          <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700">
                            <RefreshCw className="h-3 w-3" />
                            {RECURRING_INTERVALS[transaction.recurringInterval]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            One-time
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/transaction/create?edit=${transaction.id}`)
                              }
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setActionTransaction(transaction);
                                setConfirmDelete(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1">
          <span className="text-xs text-muted-foreground font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full h-8 px-2.5 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog (Mobile Long-Press & Desktop Click) */}
      <Dialog
        open={!!actionTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setActionTransaction(null);
            setConfirmDelete(false);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-md p-5 sm:p-6 rounded-3xl mx-auto border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {confirmDelete ? "Delete Transaction" : "Transaction Details"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {confirmDelete
                ? "Please confirm if you want to permanently remove this transaction."
                : "Review details or choose an action below."}
            </DialogDescription>
          </DialogHeader>

          {actionTransaction && (
            <div className="space-y-4 py-2">
              {/* Transaction Summary Card */}
              <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  {renderTransactionAvatar(actionTransaction)}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                      {actionTransaction.description || "Untitled Transaction"}
                    </h4>
                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                      <span>
                        {format(new Date(actionTransaction.date), "d MMM ''yy")}
                      </span>
                      {renderCategoryBadge(
                        actionTransaction.category,
                        getCategoryInfo(actionTransaction.category, actionTransaction)
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2 sm:pl-3">
                  <span
                    className={cn(
                      "font-bold text-base sm:text-lg",
                      actionTransaction.type === "INCOME"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {actionTransaction.type === "INCOME" ? "+" : "-"}₹
                    {formatINR(actionTransaction.amount)}
                  </span>
                </div>
              </div>

              {/* Recurring information if active */}
              {actionTransaction.isRecurring && (
                <div className="text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 p-2.5 rounded-xl flex items-center gap-2 border border-purple-100 dark:border-purple-900/50">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>
                    Recurring {RECURRING_INTERVALS[actionTransaction.recurringInterval] || ""}
                    {actionTransaction.nextRecurringDate &&
                      ` (Next: ${format(new Date(actionTransaction.nextRecurringDate), "PPP")})`}
                  </span>
                </div>
              )}

              {/* Dynamic Action Buttons or In-Dialog Confirmation Box */}
              {confirmDelete ? (
                <div className="p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        Confirm Permanent Deletion
                      </h5>
                      <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80 mt-0.5 leading-relaxed">
                        Are you sure you want to delete this transaction record?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleteLoading}
                      className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold py-2.5"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteLoading}
                      onClick={async () => {
                        await deleteFn([actionTransaction.id]);
                        setActionTransaction(null);
                        setConfirmDelete(false);
                      }}
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold gap-1.5 shadow-sm py-2.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deleteLoading ? "Deleting..." : "Yes, Delete"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    onClick={() => {
                      const id = actionTransaction.id;
                      setActionTransaction(null);
                      setConfirmDelete(false);
                      router.push(`/transaction/create?edit=${id}`);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Transaction
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/40 font-semibold py-5 rounded-xl flex items-center justify-center gap-2"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Transaction
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full rounded-xl text-slate-500 text-xs mt-1"
                    onClick={() => {
                      setActionTransaction(null);
                      setConfirmDelete(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Format Dialog Modal (CSV vs PDF) */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-md p-5 sm:p-6 rounded-3xl mx-auto border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
          <DialogHeader className="text-left pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Export Transactions
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Choose your preferred format to export {filteredAndSortedTransactions.length} transaction {filteredAndSortedTransactions.length === 1 ? "record" : "records"}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-3">
            {/* CSV Option Card */}
            <button
              type="button"
              onClick={() => {
                setExportDialogOpen(false);
                handleDownloadCSV();
              }}
              className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all group flex items-start gap-3.5 cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    CSV Spreadsheet
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    Excel / Sheets
                  </span>
                </div>
              
              </div>
            </button>

            {/* PDF Option Card */}
            <button
              type="button"
              disabled={isExportingPDF}
              onClick={() => {
                setExportDialogOpen(false);
                handleDownloadPDF();
              }}
              className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-rose-500/60 dark:hover:border-rose-500/60 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all group flex items-start gap-3.5 cursor-pointer disabled:opacity-50"
            >
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                {isExportingPDF ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    PDF Document
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shrink-0">
                    Statement
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setExportDialogOpen(false)}
              className="w-full rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 h-9 font-medium"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TransactionTable;
