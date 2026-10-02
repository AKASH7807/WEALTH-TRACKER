import "./globals.css";
import "./font.css";

import { Outfit, Josefin_Sans, Lexend } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import FullscreenHandler from "@/components/fullscreen-handler";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

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
        <head>
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Wealth" />
          <meta name="application-name" content="Wealth" />
          <meta name="msapplication-navbutton-color" content="#6366f1" />
        </head>
        <body className="flex min-h-screen flex-col font-sans antialiased">
          {/* Bridge & Fullscreen Handler for APK & Mobile WebViews */}
          <FullscreenHandler />

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

          {/* Premium Footer */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
