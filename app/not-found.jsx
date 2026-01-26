"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { AlertCircle } from "lucide-react"; // modern icon

const NotFound = () => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="w-20 h-20 text-indigo-500 animate-bounce" />
        <h1 className="text-6xl md:text-7xl font-extrabold text-indigo-700 mb-2">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-indigo-600 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 max-w-md mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back home.
        </p>
        <Link href="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full transition">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
