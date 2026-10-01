import { SignIn } from "@clerk/nextjs";
import React from "react";

export default function SignInPage() {
  return (
    <div className="w-full flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full flex justify-center",
            card: "w-full shadow-2xl border border-indigo-100/80 bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8",
            headerTitle: "text-2xl font-bold text-slate-900 tracking-tight",
            headerSubtitle: "text-sm text-slate-500",
            formButtonPrimary:
              "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all",
            formFieldInput:
              "rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition-all",
            footerActionLink: "text-indigo-600 hover:text-indigo-700 font-medium",
            socialButtonsBlockButton:
              "rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-medium text-slate-700",
            dividerLine: "bg-slate-200",
            dividerText: "text-slate-400 text-xs uppercase tracking-wider",
          },
        }}
      />
    </div>
  );
}
