import "./globals.css";
import "./font.css";

import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import dynamic from "next/dynamic";

// Lazy load Toaster since it's not critical for initial render
const Toaster = dynamic(() => import("sonner").then((mod) => ({ default: mod.Toaster })), {
  ssr: false,
});

export const metadata = {
  title: "wealth",
  description: "WealthTrack Simplifying Your Financial Path",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex min-h-screen flex-col">
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Toast Notifications */}
          <Toaster richColors />

          {/* Footer */}
          <footer className="bg-gradient-to-r from-white via-indigo-50 to-white border-t border-indigo-100">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Brand */}
                <div className="text-center md:text-left">
                  <p className="text-lg font-semibold text-gray-900 tracking-wide">
                    Wealth ERP
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Smart finance & enterprise management
                  </p>
                </div>

                {/* Links */}
                <div className="flex items-center gap-6 text-sm text-gray-700">
                  <a
                    href="/about"
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    About
                  </a>
                  <a
                    href="/feature"
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    Support
                  </a>
                </div>

                {/* Copyright */}
                <div className="text-xs text-gray-500 text-center md:text-right">
                  © {new Date().getFullYear()} Wealth ERP. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
