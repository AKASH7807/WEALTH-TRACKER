import "./globals.css";
import "./font.css";

import Link from "next/link";
import Header from "@/components/header";
import { ToasterProvider } from "@/components/toaster-provider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "wealth",
  description: "WealthTrack Simplifying Your Financial Path",
};

const currentYear = new Date().getFullYear();

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex min-h-screen flex-col">
          <Header />

          <main className="flex-1">{children}</main>

          <ToasterProvider />

          <footer className="bg-gradient-to-r from-white via-indigo-50 to-white border-t border-indigo-100">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-lg font-semibold text-gray-900 tracking-wide">
                    Wealth ERP
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Smart finance & enterprise management
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-700">
                  <Link
                    href="/about"
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    About
                  </Link>

                  <Link
                    href="/feature"
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    Features
                  </Link>

                  <Link
                    href="#"
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    Support
                  </Link>
                </div>

                <div className="text-xs text-gray-500 text-center md:text-right">
                  © {currentYear} Wealth ERP. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
