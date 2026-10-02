"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Camera,
  Target,
  ListFilter,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PREVIEWS = [
  {
    id: "activity",
    title: "Activity Feed",
    badge: "Neo-Banking Feed",
    icon: ListFilter,
    src: "/banner.jpeg",
    description: "Real-time activity feed with hold-to-edit actions and category pills.",
  },
  {
    id: "analytics",
    title: "Monthly Stepper",
    badge: "Calendar Analytics",
    icon: TrendingUp,
    src: "/banner2.jpg",
    description: "Interactive monthly overview with month selector and expense insights.",
  },
  {
    id: "scanner",
    title: "AI Receipt Scanner",
    badge: "Gemini Vision OCR",
    icon: Camera,
    src: "/banner3.jpg",
    description: "Scan physical receipts and bills with automated fallback retry.",
  },
  {
    id: "budgets",
    title: "Smart Budgets",
    badge: "Automated Limits",
    icon: Target,
    src: "/banner4.jpg",
    description: "Live progress tracking with color-coded spending alerts.",
  },
];

export function HeroSection() {
  const [currentTab, setCurrentTab] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const touchStartX = useRef(null);

  // Auto-rotate tabs (pauses while hovering or touching)
  useEffect(() => {
    if (isInteracting) return;
    const interval = setInterval(() => {
      setCurrentTab((prev) => (prev + 1) % PREVIEWS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isInteracting]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
    setIsInteracting(true);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current != null && endX != null) {
      const delta = endX - touchStartX.current;
      if (delta > 40) {
        // Swipe Right -> Prev
        setCurrentTab((prev) => (prev - 1 + PREVIEWS.length) % PREVIEWS.length);
      } else if (delta < -40) {
        // Swipe Left -> Next
        setCurrentTab((prev) => (prev + 1) % PREVIEWS.length);
      }
    }
    touchStartX.current = null;
    setTimeout(() => setIsInteracting(false), 500);
  };

  const activePreview = PREVIEWS[currentTab];

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-28">
      {/* Ambient Radial Gradient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[350px] bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-pink-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Trust & Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md text-xs mb-8 transition-transform hover:scale-105">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Next-Gen AI Wealth Intelligence 2.0
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-0.5">
            Zero Manual Clutter <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto text-slate-900 dark:text-white mb-6">
          Master Your Wealth with{" "}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Autonomous AI Intelligence
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-9">
          Real-time multi-account analytics, intelligent Gemini receipt OCR, automated budgeting, and seamless neo-banking activity feeds — built for financial freedom.
        </p>

        {/* CTAs: Primary + Secondary APK Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none mx-auto mb-10">
          {/* Primary CTA */}
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-13 px-8 rounded-full text-base font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>

          {/* Secondary Direct APK Download Button */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-13 px-7 rounded-full text-base font-bold border-slate-300/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
          >
            <a
              href="/wealth-tracker.apk"
              download="wealth-tracker.apk"
              className="flex items-center justify-center gap-2.5"
            >
              <Download className="h-4 w-4 text-purple-600 group-hover:animate-bounce" />
              <span>Download Android App</span>
            </a>
          </Button>
        </div>

        {/* 3 Micro Trust Points */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-14">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>Instant Gemini AI OCR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Bank-Grade 256-Bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Real-Time Activity Feed</span>
          </div>
        </div>

        {/* Interactive Showcase Device Window Frame */}
        <div
          className="relative max-w-5xl mx-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl shadow-purple-500/10 backdrop-blur-xl p-2.5 sm:p-4 transition-all"
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mockup Window Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 px-2 border-b border-slate-100 dark:border-slate-800 gap-2">
            {/* Window Controls (Red, Yellow, Green dots) */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
              <span className="text-[11px] font-mono text-slate-400 ml-2">
                wealthtrack.app/dashboard
              </span>
            </div>

            {/* Interactive Feature Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none justify-center sm:justify-end">
              {PREVIEWS.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = idx === currentTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentTab(idx);
                      setIsInteracting(true);
                      setTimeout(() => setIsInteracting(false), 3000);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 select-none",
                      isActive
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Viewport Screen */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-[16/9] w-full mt-3 group">
            {PREVIEWS.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-in-out",
                  idx === currentTab ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  priority={idx === 0}
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}

            {/* Floating Live Fintech Widget 1 (Top-Right) */}
            <div className="hidden sm:flex items-center gap-2.5 absolute top-5 right-5 z-20 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Monthly Savings
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  +38.4% this month
                </span>
              </div>
            </div>

            {/* Floating Live Fintech Widget 2 (Bottom-Left) */}
            <div className="hidden sm:flex items-center gap-2.5 absolute bottom-5 left-5 z-20 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
              <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Gemini Vision OCR
                </span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  100% Extraction Accuracy
                </span>
              </div>
            </div>

            {/* Mobile Tab Indicator Bar (Bottom) */}
            <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md">
              {PREVIEWS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentTab ? "w-5 bg-purple-500" : "w-1.5 bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Subtitle Caption below Mockup */}
          <div className="pt-3 px-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium truncate">
              {activePreview.badge}: {activePreview.description}
            </span>
            <span className="font-semibold text-purple-600 dark:text-purple-400 shrink-0 ml-2">
              Slide {currentTab + 1} of {PREVIEWS.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
