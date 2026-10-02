"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function FullscreenHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper to dispatch Median / GoNative scheme commands safely via hidden iframe
    const sendMedianScheme = (url) => {
      try {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        document.body.appendChild(iframe);
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
        }, 150);
      } catch (err) {}
    };

    // The internal rules payload that completely suppresses Chrome Custom Tabs / in-app browser URL bars
    const internalRules = [
      { regex: "^(?!https?://).*", mode: "external" },
      { regex: ".*", mode: "internal" },
    ];
    const internalRulesParam = encodeURIComponent(JSON.stringify(internalRules));

    const applyNativeFullscreen = () => {
      try {
        // 1. Force Median Android full-screen via JS object
        if (window.median?.android?.screen?.fullscreen) {
          window.median.android.screen.fullscreen();
        } else if (window.gonative?.android?.screen?.fullscreen) {
          window.gonative.android.screen.fullscreen();
        }

        // 2. Set screen mode to fullscreen
        if (window.median?.screen?.setMode) {
          window.median.screen.setMode({ mode: "fullscreen" });
        } else if (window.gonative?.screen?.setMode) {
          window.gonative.screen.setMode({ mode: "fullscreen" });
        }

        // 3. OVERRIDE internalExternal rules:
        // By default Median has: { regex: ".*", mode: "appbrowser" } which spawns the Chrome Custom Tab URL bar!
        // Setting mode: "internal" disables appbrowser completely!
        if (window.median?.internalExternal?.set) {
          window.median.internalExternal.set({ rules: internalRules });
        } else if (window.gonative?.internalExternal?.set) {
          window.gonative.internalExternal.set({ rules: internalRules });
        }

        // 4. Clear any native navigation bars/titles
        if (window.median?.navigationTitles?.set) {
          window.median.navigationTitles.set({ persist: true, data: [] });
        }

        // 5. Also dispatch via direct native URI scheme (works even before JS bridge loads)
        sendMedianScheme("median://screen/fullscreen");
        sendMedianScheme("median://screen/setMode?mode=fullscreen");
        sendMedianScheme(`median://internalExternal/set?rules=${internalRulesParam}`);
        sendMedianScheme("median://navigationTitles/set?persist=true&data=%5B%5D");
        sendMedianScheme("median://systemBars/set?overlay=true&style=dark");

        // 6. Direct JSBridge communication if available
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
              data: { rules: internalRules },
            })
          );
        }
      } catch (err) {}
    };

    // Standard HTML5 Fullscreen API trigger on touch / click
    const enterHtml5Fullscreen = () => {
      try {
        const docEl = document.documentElement;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => {});
          } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
          }
        }
      } catch (e) {}
    };

    // Auto-scroll 1px on load to force mobile browser to collapse the top address bar
    const collapseAddressBar = () => {
      try {
        if (window.scrollY === 0) {
          window.scrollTo(0, 1);
        }
      } catch (e) {}
    };

    // Apply native Median bridge commands immediately
    applyNativeFullscreen();

    // Re-apply when Median library announces it is ready
    window.addEventListener("median_library_ready", applyNativeFullscreen);
    window.addEventListener("gonative_library_ready", applyNativeFullscreen);

    // Trigger HTML5 fullscreen and address bar collapse on first user interaction
    window.addEventListener("touchstart", enterHtml5Fullscreen, { once: true, passive: true });
    window.addEventListener("pointerdown", enterHtml5Fullscreen, { once: true, passive: true });
    window.addEventListener("click", enterHtml5Fullscreen, { once: true, passive: true });

    const scrollTimer = setTimeout(collapseAddressBar, 300);

    // Override window.open so external Chrome Custom Tabs are never launched
    window.open = function (url) {
      if (url) window.location.href = url;
      return window;
    };

    // Intercept any anchor click with target="_blank"
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
      clearTimeout(scrollTimer);
    };
  }, [pathname]);

  return null;
}

export default FullscreenHandler;
