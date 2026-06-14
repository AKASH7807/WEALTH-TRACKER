"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [processedId, setProcessedId] = useState(null);

  const {
    loading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  // File handler (stable)
  const handleReceiptScan = useCallback(
    async (file) => {
      if (!file) return;

      if (file.size > 15 * 1024 * 1024) {
        toast.error("File size should be less than 15MB");
        return;
      }

      setProcessedId(null);
      await scanReceiptFn(file);
    },
    [scanReceiptFn],
  );

  // Effect: run only once per new scan result
  useEffect(() => {
    if (!scannedData || loading) return;

    const id = scannedData?.id || JSON.stringify(scannedData);

    if (processedId === id) return;

    setProcessedId(id);
    onScanComplete?.(scannedData);
    toast.success("Receipt scanned successfully");
  }, [scannedData, loading, processedId, onScanComplete]);

  // Open camera (stable)
  const openCamera = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) return;

    input.setAttribute("capture", "environment");
    input.click();
  }, []);

  // Open file upload (stable)
  const openUpload = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) return;

    input.removeAttribute("capture");
    input.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      handleReceiptScan(file);

      // reset so same file can be selected again
      e.target.value = "";
    },
    [handleReceiptScan],
  );

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      {/* Hidden input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Scan Button */}
        <Button
          type="button"
          variant="outline"
          className="flex-1 sm:flex-[0.6] h-12 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 text-white hover:opacity-90 transition-all shadow-md"
          onClick={openCamera}
          disabled={loading}
        >
          {loading ? (
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

        {/* Upload Button */}
        <Button
          type="button"
          variant="secondary"
          className="flex-1 sm:flex-[0.4] h-12 border-dashed border-2 bg-transparent hover:bg-slate-50 transition-all text-slate-700"
          onClick={openUpload}
          disabled={loading}
        >
          {loading ? (
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
