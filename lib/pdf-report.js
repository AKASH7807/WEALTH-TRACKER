import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generates an executive-grade PDF statement of monthly transactions.
 * Returns a Buffer that can be passed directly to Resend email attachments.
 */
export async function generateMonthlyReportPdf({
  userName,
  userEmail,
  monthName,
  year,
  stats,
  transactions = [],
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [79, 70, 229]; // Indigo #4f46e5
  const secondaryColor = [124, 58, 237]; // Violet #7c3aed
  const darkTextColor = [30, 41, 59]; // Slate 800
  const lightBgColor = [248, 250, 252]; // Slate 50
  const successColor = [16, 185, 129]; // Emerald 500
  const dangerColor = [225, 29, 72]; // Rose 600

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("WEALTH ERP", 14, 13);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Monthly Financial Statement", 14, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${monthName.toUpperCase()} ${year}`, 196, 17, { align: "right" });

  // 2. Client & Statement Info
  doc.setTextColor(...darkTextColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ACCOUNT HOLDER", 14, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(userName || "Valued Member", 14, 44);
  doc.text(userEmail || "", 14, 49);

  doc.setFont("helvetica", "bold");
  doc.text("STATEMENT DETAILS", 140, 38);

  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${monthName} 1 - ${monthName} ${stats.daysInMonth || 30}, ${year}`, 140, 44);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 140, 49);

  // 3. Executive KPI Cards
  const netSavings = stats.totalIncome - stats.totalExpenses;
  const savingsRate =
    stats.totalIncome > 0
      ? ((netSavings / stats.totalIncome) * 100).toFixed(1)
      : "0.0";

  // Card 1: Total Income
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(14, 56, 42, 22, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL INCOME", 18, 62);
  doc.setFontSize(11);
  doc.setTextColor(...successColor);
  doc.text(`+INR ${stats.totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 18, 71);

  // Card 2: Total Expenses
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(60, 56, 42, 22, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL EXPENSES", 64, 62);
  doc.setFontSize(11);
  doc.setTextColor(...dangerColor);
  doc.text(`-INR ${stats.totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 64, 71);

  // Card 3: Net Cash Flow
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(106, 56, 42, 22, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("NET CASH FLOW", 110, 62);
  doc.setFontSize(11);
  doc.setTextColor(netSavings >= 0 ? successColor[0] : dangerColor[0], netSavings >= 0 ? successColor[1] : dangerColor[1], netSavings >= 0 ? successColor[2] : dangerColor[2]);
  doc.text(`${netSavings >= 0 ? "+" : ""}INR ${netSavings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 110, 71);

  // Card 4: Savings Rate
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(152, 56, 44, 22, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("SAVINGS RATE", 156, 62);
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(`${savingsRate}%`, 156, 71);

  // 4. Category Breakdown Table
  const categoryRows = Object.entries(stats.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const pct = stats.totalExpenses > 0 ? ((amount / stats.totalExpenses) * 100).toFixed(1) : "0.0";
      return [cat.toUpperCase(), `INR ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, `${pct}%`];
    });

  let currentY = 84;

  if (categoryRows.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...darkTextColor);
    doc.text("EXPENSE BREAKDOWN BY CATEGORY", 14, currentY);

    doc.autoTable({
      startY: currentY + 3,
      head: [["Category", "Amount Spent", "% of Total"]],
      body: categoryRows,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 5. Itemized Transaction Statement
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkTextColor);
  doc.text(`ITEMIZED TRANSACTIONS (${transactions.length} Records)`, 14, currentY);

  const transactionRows = transactions.map((t) => {
    const dateStr = t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—";
    const desc = t.description || "—";
    const acc = t.account?.name || "Main";
    const cat = (t.category || "General").toUpperCase();
    const type = t.type;
    const amountStr = `${type === "EXPENSE" ? "-" : "+"}INR ${Number(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    return [dateStr, desc, acc, cat, type, amountStr];
  });

  doc.autoTable({
    startY: currentY + 3,
    head: [["Date", "Description", "Account", "Category", "Type", "Amount"]],
    body: transactionRows.length > 0 ? transactionRows : [["No transactions recorded for this period", "", "", "", "", ""]],
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 48 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 34, halign: "right" },
    },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 5) {
        if (data.cell.raw && data.cell.raw.startsWith("-")) {
          data.cell.styles.textColor = dangerColor;
        } else if (data.cell.raw && data.cell.raw.startsWith("+")) {
          data.cell.styles.textColor = successColor;
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // 6. Page Numbers on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Wealth ERP | Confidential Statement | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}
