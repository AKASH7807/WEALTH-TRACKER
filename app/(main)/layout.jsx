import React, { memo } from "react";

const MainLayout = memo(({ children }) => {
  return (
    <main className="min-h-screen pt-[70px] my-6 px-4 md:px-6 bg-gray-50">
      <div className="mx-auto container">{children}</div>
    </main>
  );
});

MainLayout.displayName = "MainLayout";

export default MainLayout;
