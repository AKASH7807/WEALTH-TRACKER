import "./globals.css";
import "./font.css";

import { Outfit, Josefin_Sans, Lexend } from "next/font/google";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-josefin",
});

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata = {
  title: "Wealth - Financial Management Platform",
  description: "WealthTrack Simplifying Your Financial Path",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wealth",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${outfit.variable} ${josefinSans.variable} ${lexend.variable}`}
      >
        <body className="flex min-h-screen flex-col font-sans antialiased">
          {/* Top progress bar for instant navigation feedback */}
          <NextTopLoader
            color="#6366f1"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #6366f1,0 0 5px #a855f7"
          />

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
                  <Link
                    href="/about"
                    prefetch={true}
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    About
                  </Link>
                  <Link
                    href="/feature"
                    prefetch={true}
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    Features
                  </Link>
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    className="hover:text-indigo-600 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
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
