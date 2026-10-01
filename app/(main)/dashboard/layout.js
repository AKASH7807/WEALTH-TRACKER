import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";

const DashboardLayout = ({ children }) => {
  return (
    <div className="px-5 py-8">
      <h1 className="gradient-title text-3xl md:text-4xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500">
        Dashboard
      </h1>

      {/* Dashboard Page  */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        {children}
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
