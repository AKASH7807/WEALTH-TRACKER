import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import MonthlyReportTrigger from "./_components/monthly-report-trigger";

const DashboardLayout = ({ children }) => {
  return (
    <div className="px-5 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="gradient-title text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Financial analytics, account balances, and automated reports
          </p>
        </div>
        <MonthlyReportTrigger />
      </div>

      {/* Dashboard Page */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        {children}
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
