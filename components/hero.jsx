"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";

const IMAGES = ["/banner.jpeg", "/banner2.jpg", "/banner3.jpg", "/banner4.jpg"];

const STARS = Array.from({ length: 3 });

const HeroSection = () => {
  const imageRef = useRef(null);
  const touchStartX = useRef(null);
  const interactionTimeoutRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

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

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (IMAGES.length <= 1 || isInteracting) return;

    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % IMAGES.length);
    }, 4000);

    return () => clearInterval(id);
  }, [isInteracting]);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
    setIsInteracting(true);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;

    if (touchStartX.current == null || endX == null) {
      setIsInteracting(false);
      return;
    }

    const delta = endX - touchStartX.current;
    const threshold = 50;

    if (delta > threshold) {
      setCurrent((c) => (c - 1 + IMAGES.length) % IMAGES.length);
    } else if (delta < -threshold) {
      setCurrent((c) => (c + 1) % IMAGES.length);
    }

    touchStartX.current = null;

    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 300);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-700 shadow-sm text-xs">
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

          <div className="flex -space-x-1">
            {STARS.map((_, i) => (
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

          <p className="text-xs font-medium">Trusted by 100+ users</p>
        </div>

        <h1 className="gradient-title pt-3 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Manage Your Finances <br />
          <span className="gradient-title text-blue-600">Smarter with AI</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          An AI-powered finance management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>

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
              href="https://drive.google.com/file/d/17XIWgUa9O3pstwgWAnGhZBuzNHHBxEln/view?usp=drivesdk"
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

        <div className="mt-16" ref={imageRef}>
          <div className="md:hidden">
            <div
              className="relative overflow-hidden mx-auto w-[90vw] rounded-2xl shadow-2xl border"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={() => setIsInteracting(false)}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  width: `${IMAGES.length * 90}vw`,
                  transform: `translateX(-${current * 90}vw)`,
                }}
              >
                {IMAGES.map((src, idx) => (
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

              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                {IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === current ? "bg-white scale-110" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6 mx-auto w-[90vw] max-w-[1400px]">
            {IMAGES.map((src, idx) => (
              <div
                key={src}
                className="overflow-hidden rounded-2xl border bg-white/60 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl transform-gpu will-change-transform"
              >
                <Image
                  src={src}
                  width={600}
                  height={400}
                  loading="lazy"
                  alt={`grid-preview-${idx}`}
                  className="w-full h-40 lg:h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
