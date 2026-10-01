"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Mail,
  FileDown,
  Loader2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  sendMonthlyReportEmail,
  downloadMonthlyReportPdfAction,
} from "@/actions/monthly-report";

export default function MonthlyReportTrigger() {
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const handleSendEmail = async (monthOffset = 1) => {
    try {
      setIsEmailing(true);
      toast.loading("Generating statement and sending email...", { id: "report-email" });

      const result = await sendMonthlyReportEmail({ monthOffset });

      if (result.success) {
        toast.success(result.message || "Monthly report sent successfully!", {
          id: "report-email",
          description: "Check your inbox for the itemized statement and attached PDF.",
        });
      } else {
        toast.error(result.error || "Failed to send email", { id: "report-email" });
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while sending email", { id: "report-email" });
    } finally {
      setIsEmailing(false);
    }
  };

  const handleDownloadPdf = async (monthOffset = 1) => {
    try {
      setIsDownloading(true);
      toast.loading("Generating executive PDF statement...", { id: "report-pdf" });

      const result = await downloadMonthlyReportPdfAction({ monthOffset });

      if (result.success && result.base64) {
        // Trigger download in browser
        const linkSource = `data:application/pdf;base64,${result.base64}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = result.filename || "Monthly-Statement.pdf";
        downloadLink.click();

        toast.success("Statement downloaded successfully!", { id: "report-pdf" });
      } else {
        toast.error(result.error || "Failed to generate PDF", { id: "report-pdf" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF statement", { id: "report-pdf" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
              disabled={isEmailing || isDownloading}
            >
              {isEmailing || isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-indigo-600" />
              ) : (
                <Mail className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              )}
              <span>Monthly Report</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 p-1.5">
            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5 flex items-center justify-between">
              <span>Financial Statements</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Email Actions */}
            <DropdownMenuItem
              onClick={() => handleSendEmail(1)}
              disabled={isEmailing}
              className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-md text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200"
            >
              <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
              <div className="flex flex-col">
                <span>Email Last Month&apos;s Report</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Full summary + PDF attachment
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleSendEmail(0)}
              disabled={isEmailing}
              className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-md text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200"
            >
              <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col">
                <span>Email Current Month (M-T-D)</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Month-to-date interim summary
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Download PDF Actions */}
            <DropdownMenuItem
              onClick={() => handleDownloadPdf(1)}
              disabled={isDownloading}
              className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <FileDown className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <div className="flex flex-col">
                <span>Download Last Month PDF</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Official itemized statement
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleDownloadPdf(0)}
              disabled={isDownloading}
              className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <FileDown className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <div className="flex flex-col">
                <span>Download Current Month PDF</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Current statement to date
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setInfoDialogOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Automated Monthly Cron Info</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cron Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Calendar className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Automated Monthly Reports
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
              Every month at midnight (12:00 AM on the 1st), our background cron engine compiles your complete monthly financial activity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 mt-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Itemized PDF Statement
                </span>
                <p className="text-muted-foreground mt-0.5">
                  Full list of all income and expenses with date, category, and account breakdown attached as a PDF.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  AI Financial Analysis
                </span>
                <p className="text-muted-foreground mt-0.5">
                  Gemini AI summarizes your savings rate, alerts on high-spend categories, and provides practical advice.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Responsive Email Template
                </span>
                <p className="text-muted-foreground mt-0.5">
                  Designed for perfect contrast and readability across mobile and desktop email clients.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInfoDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                setInfoDialogOpen(false);
                handleSendEmail(1);
              }}
              disabled={isEmailing}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Send Test Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
