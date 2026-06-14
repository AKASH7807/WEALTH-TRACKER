"use client";

import dynamic from "next/dynamic";

// Load the themed Toaster (uses next-themes) dynamically on the client
const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => ({ default: mod.Toaster })),
  { ssr: false },
);

export function ToasterProvider() {
  return <Toaster richColors />;
}
