import React from "react";
import { BarLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h3 className="text-xl font-semibold text-center mb-4 text-indigo-700 opacity-80 animate-pulse">
          Loading Data...
        </h3>
        <BarLoader className="mx-auto" width={"100%"} color="#9333ea" />
      </div>
    </div>
  );
};

export default Loading;
