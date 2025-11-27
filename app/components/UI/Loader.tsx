// components/ui/FullPageLoader.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  minDurationMs?: number; // minimum time to show loader (ms)
};

export default function FullPageLoader({ minDurationMs = 600 }: Props) {
  const [visible, setVisible] = useState(true); // overlay visible
  const [fading, setFading] = useState(false); // fade-out in progress

  useEffect(() => {
    let minTimer: number | undefined;
    let loaded = false;

    const tryHide = () => {
      // ensure min duration elapsed
      const hide = () => {
        setFading(true);
        // keep overlay until CSS transition finishes (300ms)
        setTimeout(() => setVisible(false), 350);
      };

      if (!loaded) {
        loaded = true;
        // wait minDuration then start fade
        minTimer = window.setTimeout(hide, minDurationMs);
      } else {
        hide();
      }
    };

    // If window already loaded (fast refresh or cached), just wait minDuration then hide
    if (document.readyState === "complete") {
      minTimer = window.setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 350);
      }, minDurationMs);
    } else {
      const onLoad = () => {
        // give tiny delay so user sees loader for at least minDuration (if needed)
        minTimer = window.setTimeout(() => {
          setFading(true);
          setTimeout(() => setVisible(false), 350);
        }, minDurationMs);
      };
      window.addEventListener("load", onLoad, { once: true });
      // safety: hide after 10s if load never fires
      const fallback = window.setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 350);
      }, 10000);
      return () => {
        window.removeEventListener("load", onLoad);
        clearTimeout(minTimer);
        clearTimeout(fallback);
      };
    }

    return () => clearTimeout(minTimer);
  }, [minDurationMs]);

  if (!visible) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm transition-opacity duration-300 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Big blue animated spinner */}
        <svg
          className="animate-spin h-20 w-20 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>

        {/* Title + pulsing bar */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-blue-700">Tariq Medical Centre</h2>
          <p className="mt-1 text-sm text-slate-600">Preparing your experience…</p>

          <div className="mt-4 w-48 h-2 bg-blue-100 rounded overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-[pulse_1.6s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
