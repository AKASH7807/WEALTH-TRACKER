"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Camera,
  Loader2,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { scanReceipt } from "@/actions/transaction";

/**
 * Client-side image optimizer to downscale huge smartphone camera photos (5-15MB)
 * to a lightweight, crisp receipt image (~200-400KB).
 * Drastically speeds up network transfer and AI OCR extraction while preventing timeouts.
 */
async function optimizeReceiptImage(file) {
  return new Promise((resolve) => {
    // If not an image or already small (< 600KB), use as is
    if (!file.type || !file.type.startsWith("image/") || file.size < 600 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const maxDimension = 1800; // Optimal for sharp OCR text
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const cleanFileName = file.name.replace(/\.[^.]+$/, ".jpg");
              const optimized = new File([blob], cleanFileName, {
                type: "image/jpeg",
              });
              resolve(optimized);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  // Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [lastFile, setLastFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [extractedSummary, setExtractedSummary] = useState(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /**
   * Core scan runner with automated 1-retry fallback
   */
  const executeScan = useCallback(
    async (rawFile, isRetryAttempt = false) => {
      if (!rawFile) return;

      setIsScanning(true);
      setScanError(null);
      setExtractedSummary(null);

      try {
        setScanStatus(
          isRetryAttempt
            ? "Retrying scan with backup AI model..."
            : "Optimizing image & preparing AI scanner..."
        );

        // Optimize image to keep upload fast & reliable
        const fileToScan = await optimizeReceiptImage(rawFile);

        setScanStatus("Analyzing receipt & reading text with AI...");

        // Call the server action
        const result = await scanReceipt(fileToScan);

        if (result && (result.amount !== null || result.description || result.merchantName)) {
          setExtractedSummary(result);
          setIsScanning(false);
          setScanStatus("");
          onScanComplete(result);
          toast.success("Receipt scanned & fields populated automatically!");
          return;
        }

        throw new Error("Could not extract any transaction details from this image.");
      } catch (err) {
        console.warn("Scan attempt failed:", err?.message || err);

        // If this was the first try, automatically retry once after a short delay
        if (!isRetryAttempt) {
          setScanStatus("Retrying with backup AI model...");
          await new Promise((resolve) => setTimeout(resolve, 800));
          return executeScan(rawFile, true);
        }

        // If retry also failed, display user-friendly error with 1-click manual retry
        setScanError(
          err.message ||
            "Could not read receipt clearly. Please check lighting or click Retry."
        );
        setIsScanning(false);
        setScanStatus("");
        toast.error("Receipt scan failed. Click Retry or try a clearer photo.");
      }
    },
    [onScanComplete]
  );

  /**
   * Handle file picked from input (camera or file picker)
   */
  const handleFileChange = async (file) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    // Generate preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    setLastFile(file);

    await executeScan(file, false);
  };

  /**
   * Manual 1-click retry button
   */
  const handleManualRetry = () => {
    if (lastFile) {
      executeScan(lastFile, false);
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Reset / clear current scan
   */
  const handleResetScan = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLastFile(null);
    setScanError(null);
    setExtractedSummary(null);
    setIsScanning(false);
    setScanStatus("");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileChange(file);
            e.target.value = "";
          }
        }}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Smart Receipt Scanner
            </span>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Auto-extract amount, date, merchant, and category with AI
            </p>
          </div>
        </div>

        {isScanning && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Scanning...
          </span>
        )}
      </div>

      {/* Progress / Status banner while scanning */}
      {isScanning && (
        <div className="mb-3.5 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100/80 flex items-center gap-2.5 text-xs text-indigo-800 animate-in fade-in duration-200">
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-indigo-600" />
          <span className="font-medium">{scanStatus || "Analyzing receipt..."}</span>
        </div>
      )}

      {/* Extracted Success Banner */}
      {!isScanning && extractedSummary && (
        <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-2 text-xs text-emerald-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="font-bold">
                {extractedSummary.amount ? `₹${extractedSummary.amount.toFixed(2)}` : "Amount read"}
              </span>
              {extractedSummary.merchantName && (
                <span className="text-emerald-700 ml-1.5">• {extractedSummary.merchantName}</span>
              )}
              {extractedSummary.category && (
                <span className="text-emerald-600 capitalize ml-1.5">
                  ({extractedSummary.category.replace(/-/g, " ")})
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetScan}
            className="text-emerald-700 hover:text-emerald-900 p-1"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Error state with 1-click Retry button */}
      {!isScanning && scanError && (
        <div className="mb-3.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-900">Scan didn't catch all details</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{scanError}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={handleManualRetry}
              className="h-8 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              Retry Scan
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="h-8 text-xs rounded-lg border-rose-200 text-rose-800 hover:bg-rose-100"
            >
              Choose Another Photo
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Camera / Scan Button */}
        <Button
          type="button"
          disabled={isScanning}
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.setAttribute("capture", "environment");
              fileInputRef.current.click();
            }
          }}
          className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing Receipt...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Take Photo / Scan</span>
            </>
          )}
        </Button>

        {/* Upload File Button */}
        <Button
          type="button"
          variant="outline"
          disabled={isScanning}
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute("capture");
              fileInputRef.current.click();
            }
          }}
          className="h-11 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
        >
          <Upload className="h-4 w-4 text-slate-500" />
          <span>Upload Receipt Image</span>
        </Button>
      </div>
    </div>
  );
}

export default ReceiptScanner;
