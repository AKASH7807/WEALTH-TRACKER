"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      if (window.scrollY > 100) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 pt-28 pb-24 text-center">
        {/* Compact Single-Line Trust Badge */}
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-700 shadow-sm text-xs">
          {/* Avatar Stack (3 only) */}
          <div className="flex -space-x-2">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
              alt="user1"
              className="h-5 w-5 object-cover rounded-full border-2 border-white"
            />
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
              alt="user2"
              className="h-5 w-5 object-cover rounded-full border-2 border-white"
            />
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
              alt="user3"
              className="h-5 w-5 object-cover rounded-full border-2 border-white"
            />
          </div>

          {/* Stars (3 only) */}
          <div className="flex -space-x-1">
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

          {/* Text */}
          <p className="text-xs font-medium">Trusted by 100+ users</p>
        </div>

        {/* Heading */}
        <h1 className="gradient-title  pt-3 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Manage Your Finances <br />
          <span className="gradient-title text-blue-600">Smarter with AI</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          An AI-powered finance management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>

        {/* CTA Container */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Button
            asChild
            size="lg"
            className="group w-full sm:w-auto px-14 py-4 rounded-full text-base bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95"
          >
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="group w-full sm:w-auto px-8 py-4 rounded-full text-base border-gray-400/60 bg-white/70 backdrop-blur-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 active:scale-95"
          >
            <Link
              href="/path-to-your-app.apk"
              target="_blank"
              className="flex items-center justify-center gap-2"
              download
            >
              <Download
                size={18}
                className="text-gray-500 group-hover:text-white transition-colors"
              />
              <span>Download App</span>
            </Link>
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16">
          <div ref={imageRef} className="transition-transform duration-500">
            <Image
              src="/banner.jpeg"
              width={1200}
              height={720}
              alt="Finance dashboard preview"
              priority
              className="rounded-2xl border shadow-2xl mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
