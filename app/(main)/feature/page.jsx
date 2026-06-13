"use client";

import {
  BarChart3,
  CreditCard,
  ScanLine,
  Wallet,
  Layers,
  Sparkles,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

// Note: Client component, ISR handled by Next.js default 
export default function FeaturesPage() {
  const features = [
    {
      title: "AI-Driven Analytics",
      description:
        "Understand spending behavior with real-time insights powered by intelligent financial models.",
      icon: BarChart3,
    },
    {
      title: "Smart Expense Tracking",
      description:
        "Automatically categorize and track transactions across accounts with zero manual effort.",
      icon: CreditCard,
    },
    {
      title: "Receipt Intelligence",
      description:
        "Scan receipts instantly and extract structured data using advanced AI recognition.",
      icon: ScanLine,
    },
    {
      title: "Budget Optimization",
      description:
        "Create adaptive budgets with intelligent recommendations based on your activity.",
      icon: Wallet,
    },
    {
      title: "Multi-Account Control",
      description:
        "Manage bank accounts, cards, and wallets from a single unified dashboard.",
      icon: Layers,
    },
    {
      title: "Automated Insights",
      description:
        "Receive proactive insights and alerts that help you stay financially ahead.",
      icon: Sparkles,
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
      <div className="absolute -top-40 -left-40 size-[500px] bg-indigo-200/30 blur-[160px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 size-[500px] bg-violet-200/30 blur-[160px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            Everything you need to manage finances
            <span className="text-indigo-600"> intelligently</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            A modern finance SaaS built for clarity, speed, and smarter
            enterprise decisions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="group rounded-2xl p-[1px] bg-gradient-to-br from-indigo-300 via-violet-300 to-indigo-300 hover:from-indigo-500 hover:to-violet-500 transition"
              >
                <div className="h-full rounded-2xl bg-white p-6 shadow-sm group-hover:shadow-lg transition">
                  <div className="flex items-center justify-center size-12 rounded-xl bg-indigo-50 mb-4">
                    <Icon className="size-6 text-indigo-600" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA SECTION */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Built for modern finance teams
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Simplify workflows, gain clarity, and scale confidently with Wealth
            ERP.
          </p>

          <div className="mt-6 flex justify-center">
            {/* LOGGED OUT */}
            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <button className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
                  Start Free Trial
                </button>
              </SignInButton>
            </SignedOut>

            {/* LOGGED IN */}
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </section>
  );
}
