"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
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
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size should be less than 15MB");
      return;
    }

    setHasProcessed(false);
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading && !hasProcessed) {
      setHasProcessed(true);
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scannedData, scanReceiptLoading, hasProcessed]);

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
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

      {/* Buttons Container */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Scan Receipt Button */}
        <Button
          type="button"
          variant="outline"
          className="flex-1 sm:flex-[0.6] h-12 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 text-white hover:opacity-90 transition-all shadow-md"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.setAttribute("capture", "environment");
              fileInputRef.current.click();
            }
          }}
          disabled={scanReceiptLoading}
        >
          {scanReceiptLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Camera className="mr-2 h-5 w-5" />
              <span>Scan Receipt</span>
            </>
          )}
        </Button>

        {/* Upload File Button */}
        <Button
          type="button"
          variant="secondary"
          className="flex-1 sm:flex-[0.4] h-12 border-dashed border-2 bg-transparent hover:bg-slate-50 transition-all text-slate-700"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute("capture");
              fileInputRef.current.click();
            }
          }}
          disabled={scanReceiptLoading}
        >
          {scanReceiptLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Upload className="mr-2 h-5 w-5" />
          )}
          <span>Upload File</span>
        </Button>
      </div>
    </div>
  );
}
