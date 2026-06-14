import React, { Suspense, memo } from "react";
import DashboardPage from "./page";
import { BarLoader } from "react-spinners";

const DashboardLoader = () => (
  <BarLoader className="mt-4" width="100%" color="#9333ea" />
);

const DashboardLayout = memo(function DashboardLayout() {
  return (
    <div className="px-5 py-8">
      <h1 className="gradient-title mb-5 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
        Dashboard
      </h1>

      <Suspense fallback={<DashboardLoader />}>
        <DashboardPage />
      </Suspense>
    </div>
  );
});

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;
