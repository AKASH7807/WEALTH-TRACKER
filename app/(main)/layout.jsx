import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-[calc(100vh-70px)] w-full pt-[72px] sm:pt-[85px] pb-10 sm:pb-16 px-2 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
};

export default MainLayout;
