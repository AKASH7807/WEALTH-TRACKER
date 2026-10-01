"use client";

import React, { useEffect } from "react";

const AuthLayout = ({ children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-70px)] w-full flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-[450px] rounded-full bg-indigo-200/40 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 size-[450px] rounded-full bg-violet-200/40 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] rounded-full bg-blue-100/30 blur-[100px]"
      />

      {/* Main Centered Pane */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
