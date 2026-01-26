"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, Menu, X } from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Gradient + glass */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-400 backdrop-blur-md">
        <nav className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Wealth Logo"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu (Before Login) */}
          <SignedOut>
            <ul className="hidden md:flex items-center gap-10 text-sm text-white font-medium">
              <li>
                <Link href="/" className="hover:text-white/70">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/feature" className="hover:text-white/70">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={() => setOpen(false)}>
                  About
                </Link>
              </li>
            </ul>
          </SignedOut>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* BEFORE LOGIN */}
            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <button className="w-full px-5 py-2 text-sm font-semibold rounded-full bg-white text-indigo-700 hover:bg-white/90 transition">
                  Login
                </button>
              </SignInButton>
            </SignedOut>

            {/* AFTER LOGIN */}
            <SignedIn>
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-white/30
              bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-200"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                href="/transaction/create"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-white text-indigo-700 hover:bg-white/90 transition"
              >
                <PenBox size={18} />
                Add Transaction
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-white/40 rounded-full",
                  },
                }}
              />
            </SignedIn>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-white"
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden bg-gradient-to-r from-indigo-500 to-violet-400 px-6 pb-6">
            <SignedOut>
              <ul className="flex flex-col gap-4 text-white text-sm mt-4">
                <li>
                  <Link href="/" onClick={() => setOpen(false)}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/feature" onClick={() => setOpen(false)}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/about" onClick={() => setOpen(false)}>
                    About
                  </Link>
                </li>
              </ul>

              <div className="mt-6 flex flex-col gap-3">
                <SignInButton forceRedirectUrl="/dashboard">
                  <button className="w-full py-2 rounded-full bg-white text-indigo-700 font-semibold">
                    Login
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2 rounded-full text-white border border-white/30"
                >
                  Dashboard
                </Link>

                <Link
                  href="/transaction/create"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2 rounded-full bg-white text-indigo-700 font-semibold"
                >
                  Add Transaction
                </Link>
              </div>
            </SignedIn>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
