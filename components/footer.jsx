"use client";

import React from "react";
import Link from "next/link";
import { Download, TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-slate-800/80 overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        {/* Main Grid: 3 Clean Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & APK CTA (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Wealth<span className="text-indigo-400">Track</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Intelligent wealth tracking, enterprise finance analytics, and AI-powered
              receipt scanning designed for modern individuals and growing teams.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Bank-Grade 256-bit SSL</span>
            </div>

            {/* Direct APK Download Banner without "fullscreen" word */}
            <div className="pt-1">
              <a
                href="/wealth-tracker.apk"
                download="wealth-tracker.apk"
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95 group"
              >
                <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Download className="h-4 w-4 text-white group-hover:animate-bounce" />
                </div>
                <div className="text-left">
                  <div className="font-bold leading-tight">Download Android App</div>
                  <div className="text-[10px] text-white/70 font-normal">
                    v1.0 • Direct APK
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/feature"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  Features & AI
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  About Platform
                </Link>
              </li>
              <li>
                <Link
                  href="/transaction/categories"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  Categories Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features & Capabilities (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Features
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/transaction/create"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  Add Transaction
                </Link>
              </li>
              <li>
                <Link
                  href="/transaction/create"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  AI Receipt Scanner
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  Monthly Stepper
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="hover:text-white transition-colors"
                >
                  Budget Tracking
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Tech Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Wealth ERP. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <Link
              href="/feature"
              className="hover:text-indigo-400 transition-colors"
            >
              Privacy & Security
            </Link>
            <span>•</span>
            <Link
              href="/about"
              className="hover:text-indigo-400 transition-colors"
            >
              Terms of Use
            </Link>
            <span>•</span>
            <a
              href="/wealth-tracker.apk"
              download="wealth-tracker.apk"
              className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Download APK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
