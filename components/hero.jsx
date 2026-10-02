"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ArrowRight, Download } from "lucide-react";

const images = ["/banner.jpeg", "/banner2.jpg", "/banner3.jpg", "/banner4.jpg"];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const imageRef = useRef(null);
  const touchStartX = useRef(null);

  // Auto-rotate carousel on mobile
  useEffect(() => {
    if (isInteracting) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length, isInteracting]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
    setIsInteracting(true);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current == null || endX == null) {
      setIsInteracting(false);
      return;
    }
    const delta = endX - touchStartX.current;
    const threshold = 50; // px
    if (delta > threshold) {
      setCurrent((c) => (c - 1 + images.length) % images.length);
    } else if (delta < -threshold) {
      setCurrent((c) => (c + 1) % images.length);
    }
    touchStartX.current = null;
    setTimeout(() => setIsInteracting(false), 350);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 py-16 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        {/* Compact Single-Line Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm text-xs mb-6 backdrop-blur-md">
          {/* Avatar Stack (3 users) */}
          <div className="flex -space-x-2">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
              alt="user1"
              className="h-5 w-5 object-cover rounded-full border-2 border-white dark:border-slate-900"
            />
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
              alt="user2"
              className="h-5 w-5 object-cover rounded-full border-2 border-white dark:border-slate-900"
            />
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
              alt="user3"
              className="h-5 w-5 object-cover rounded-full border-2 border-white dark:border-slate-900"
            />
          </div>

          {/* Stars */}
          <div className="flex -space-x-0.5">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-amber-500"
                  aria-hidden="true"
                >
                  <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.782 1.4 8.162L12 18.896 5.666 23.155l1.4-8.162L1.132 9.211l8.2-1.193L12 .587z" />
                </svg>
              ))}
          </div>
          <p className="text-xs font-semibold tracking-tight">
            Trusted by 100+ users
          </p>
        </div>

        {/* Heading with Unique Custom Font */}
        <h1 className="gradient-title pt-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-5 leading-tight">
          Manage Your Finances <br className="hidden sm:inline" />
          <span className="gradient-title text-indigo-600 dark:text-indigo-400">
            Smarter with AI
          </span>
        </h1>

        {/* Clean, Readable Description */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 px-2">
          An AI-powered finance management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>

        {/* CTA Container with Correct Proportions & Equal Button Sizes */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-none mx-auto mb-12">
          {/* When User is Logged In -> Go to Dashboard */}
          <SignedIn>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full text-base font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
            >
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </SignedIn>

          {/* When User is NOT Logged In -> Get Started */}
          <SignedOut>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full text-base font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
            >
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </SignedOut>

          {/* Secondary Direct APK Download Button - Perfectly Matched Proportions */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full text-base font-bold border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:border-indigo-600 text-slate-800 dark:text-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
          >
            <a
              href="/wealth-tracker.apk"
              download="wealth-tracker.apk"
              className="flex items-center justify-center gap-2 w-full"
            >
              <Download className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
              <span>Download App</span>
            </a>
          </Button>
        </div>

        {/* Dashboard Preview: Mobile Carousel (90vw) & Desktop 4-Col Grid */}
        <div className="mt-8" ref={imageRef}>
          {/* Mobile: Centered 90vw carousel with smooth swipe & pill dots */}
          <div className="md:hidden">
            <div
              className="relative overflow-hidden mx-auto w-[90vw] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={() => setIsInteracting(false)}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  width: `${images.length * 90}vw`,
                  transform: `translateX(-${current * 90}vw)`,
                }}
              >
                {images.map((src, idx) => (
                  <div
                    key={src}
                    className="flex-shrink-0 w-[90vw] relative overflow-hidden"
                    style={{ height: "calc(90vw * 9 / 16)" }}
                  >
                    <Image
                      src={src}
                      fill
                      alt={`dashboard-preview-${idx}`}
                      priority={idx === 0}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Carousel Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-sm">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-5 bg-white shadow-sm"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Premium 4-Column Showcase Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 mx-auto w-[90vw] max-w-[1400px]">
            {images.map((src, idx) => (
              <div
                key={src}
                className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu will-change-transform"
              >
                <Image
                  src={src}
                  width={600}
                  height={400}
                  alt={`grid-preview-${idx}`}
                  priority={idx < 2}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="w-full h-40 lg:h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
