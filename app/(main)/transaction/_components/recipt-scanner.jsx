"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2, Upload, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be less than 15MB");
      return;
    }

    setHasProcessed(false);
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading && !hasProcessed) {
      setHasProcessed(true);
      onScanComplete(scannedData);
      toast.success("Receipt scanned & fields populated automatically!");
    }
  }, [scannedData, scanReceiptLoading, hasProcessed, onScanComplete]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleReceiptScan(file);
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

        {scanReceiptLoading && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-2.5 py-1 text-xs font-medium text-indigo-700 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Scanning...
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Camera / Scan Button */}
        <Button
          type="button"
          disabled={scanReceiptLoading}
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.setAttribute("capture", "environment");
              fileInputRef.current.click();
            }
          }}
          className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
        >
          {scanReceiptLoading ? (
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
          disabled={scanReceiptLoading}
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
