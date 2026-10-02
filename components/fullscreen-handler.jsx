"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function FullscreenHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect if running inside Median, Android WebView, or standalone PWA
    const userAgent = navigator.userAgent || "";
    const isMedian =
      /median|gonative/i.test(userAgent) ||
      typeof window.median !== "undefined" ||
      typeof window.gonative !== "undefined" ||
      typeof window.JSBridge !== "undefined";

    const isWebView =
      isMedian ||
      /wv|Android.*Version\/[\d.]+/i.test(userAgent) ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    // Function to apply native full screen commands to Median / Android wrappers
    const applyNativeFullscreen = () => {
      try {
        // 1. Force Median Android full-screen
        if (window.median?.android?.screen?.fullscreen) {
          window.median.android.screen.fullscreen();
        } else if (window.gonative?.android?.screen?.fullscreen) {
          window.gonative.android.screen.fullscreen();
        }

        // 2. Set screen mode to fullscreen
        if (window.median?.screen?.setMode) {
          window.median.screen.setMode({ mode: "fullscreen" });
        }

        // 3. Keep ALL URLs internal inside the native WebView
        // This removes the Chrome Custom Tab and URL navigation bar!
        if (window.median?.internalExternal?.set) {
          window.median.internalExternal.set({
            rules: [
              { regex: "^(?!https?://).*", mode: "external" },
              { regex: ".*", mode: "internal" },
            ],
          });
        }

        // 4. Clear any native navigation bars/titles
        if (window.median?.navigationTitles?.set) {
          window.median.navigationTitles.set({ persist: true, data: [] });
        }

        // 5. Direct JSBridge communication if available
        if (window.JSBridge && typeof window.JSBridge.postMessage === "function") {
          window.JSBridge.postMessage("median://screen/fullscreen");
          window.JSBridge.postMessage(
            JSON.stringify({
              medianCommand: "median://screen/setMode",
              data: { mode: "fullscreen" },
            })
          );
          window.JSBridge.postMessage(
            JSON.stringify({
              medianCommand: "median://internalExternal/set",
              data: {
                rules: [
                  { regex: "^(?!https?://).*", mode: "external" },
                  { regex: ".*", mode: "internal" },
                ],
              },
            })
          );
          window.JSBridge.postMessage(
            JSON.stringify({
              medianCommand: "median://systemBars/set",
              data: { overlay: true, style: "light" },
            })
          );
        }
      } catch (err) {
        // Fail silently
      }
    };

    // Apply immediately
    applyNativeFullscreen();

    // Listen for Median / GoNative bridge ready events
    window.addEventListener("median_library_ready", applyNativeFullscreen);
    window.addEventListener("gonative_library_ready", applyNativeFullscreen);

    // Override window.open inside WebView so external Chrome tabs are never spawned
    if (isWebView) {
      window.open = function (url) {
        if (url) window.location.href = url;
        return window;
      };

      // Intercept anchor clicks with target="_blank"
      const handleAnchorClick = (e) => {
        const anchor = e.target.closest("a");
        if (!anchor) return;
        if (
          anchor.target === "_blank" &&
          anchor.href &&
          !anchor.hasAttribute("download") &&
          !anchor.href.startsWith("blob:")
        ) {
          e.preventDefault();
          window.location.href = anchor.href;
        }
      };

      document.addEventListener("click", handleAnchorClick, true);

      return () => {
        window.removeEventListener("median_library_ready", applyNativeFullscreen);
        window.removeEventListener("gonative_library_ready", applyNativeFullscreen);
        document.removeEventListener("click", handleAnchorClick, true);
      };
    }

    return () => {
      window.removeEventListener("median_library_ready", applyNativeFullscreen);
      window.removeEventListener("gonative_library_ready", applyNativeFullscreen);
    };
  }, [pathname]);

  return null;
}

export default FullscreenHandler;
