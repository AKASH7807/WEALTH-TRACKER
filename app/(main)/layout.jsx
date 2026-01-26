import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen pt-[70px] my-6 px-4 md:px-6 bg-gray-50">
      <div className="container mx-auto">{children}</div>
    </div>
  );
};

export default MainLayout;
