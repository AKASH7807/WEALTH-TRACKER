"use client"; 

import React, { useEffect } from "react";

const AuthLayout = ({ children }) => {
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-10 md:pt-22 pb-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

export default AuthLayout;
