// components/admin/AdminOverviewRealtime.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { StatCard } from "@/components/admin/Component";

import {
  Box,
  CalendarCheck,
  Users,
  FileText,
  Briefcase,
  Layers
} from "lucide-react";

const resources = [
  { key: "products", label: "Pharmacy Products", icon: Box, gradient: "from-blue-500 to-blue-600" },
  { key: "appointments", label: "Appointments Today", icon: CalendarCheck, gradient: "from-cyan-500 to-cyan-600" },
  { key: "doctors", label: "Active Doctors", icon: Users, gradient: "from-indigo-500 to-indigo-600" },
  { key: "prescriptions", label: "Prescriptions", icon: FileText, gradient: "from-blue-600 to-blue-700" },
  { key: "services", label: "Services", icon: Briefcase, gradient: "from-sky-500 to-sky-600" },
  { key: "departments", label: "Departments", icon: Layers, gradient: "from-blue-700 to-blue-800" },
];

// Next.js-aware fetcher with cache + ISR
const fetcher = async (url: string) => {
  const r = await fetch(url, {
    credentials: "same-origin",
    next: { revalidate: 10 },
  });

  if (!r.ok) throw new Error(`Fetch error ${r.status}`);
  try {
    return await r.json();
  } catch {
    const txt = await r.text();
    try {
      return JSON.parse(txt);
    } catch {
      return txt;
    }
  }
};

function getCountFromResponse(res: any) {
  if (!res) return 0;
  if (typeof res === "number") return res;
  if (res.count) return res.count;
  if (res.total) return res.total;
  if (Array.isArray(res)) return res.length;
  if (Array.isArray(res.data)) return res.data.length;
  if (Array.isArray(res.items)) return res.items.length;
  for (const k of Object.keys(res)) if (Array.isArray(res[k])) return res[k].length;
  return 0;
}

export default function AdminOverviewRealtime() {
  const items = resources.map((r) => ({ ...r, url: `/api/admin/${r.key}` }));

  const swrList = items.map((it) =>
    useSWR(it.url, fetcher, { revalidateOnFocus: true, refreshInterval: 0 })
  );

  const esRefs = useRef<Record<string, EventSource | null>>({});
  const prevCounts = useRef<Record<string, number>>({});
  const [animState, setAnimState] = useState<Record<string, boolean>>({});
  const timers = useRef<Record<string, any>>({});

  // Trigger animation for fading/slide effect
  function triggerAnimation(url: string) {
    if (timers.current[url]) clearTimeout(timers.current[url]);

    setAnimState((s) => ({ ...s, [url]: true }));

    timers.current[url] = setTimeout(
      () => setAnimState((s) => ({ ...s, [url]: false })),
      800
    );
  }

  // SSE realtime stream + fallback polling
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    items.forEach((it) => {
      const streamUrl = `/api/admin/stream?resource=${it.key}`;
      let es: EventSource | null = null;
      let pollInterval: any = null;

      if (window.EventSource) {
        try {
          es = new EventSource(streamUrl, { withCredentials: true } as any);
          esRefs.current[it.url] = es;

          const onMessage = (ev: MessageEvent) => {
            mutate(it.url).then(() => triggerAnimation(it.url));
          };

          const onError = () => {
            es?.close();
            pollInterval = setInterval(
              () => mutate(it.url).then(() => triggerAnimation(it.url)),
              30000
            );
          };

          es.addEventListener("message", onMessage);
          es.addEventListener("error", onError);

          cleanups.push(() => {
            es?.close();
            if (pollInterval) clearInterval(pollInterval);
          });

          return;
        } catch {}
      }

      pollInterval = setInterval(
        () => mutate(it.url).then(() => triggerAnimation(it.url)),
        30000
      );

      cleanups.push(() => clearInterval(pollInterval));
    });

    return () => {
      Object.values(esRefs.current).forEach((e) => e?.close());
      cleanups.forEach((c) => c());
    };
  }, []);

  // Detect count changes, animate
  useEffect(() => {
    items.forEach((it, i) => {
      const data = swrList[i].data;
      const count = getCountFromResponse(data);
      const prev = prevCounts.current[it.url];

      if (prev !== count) triggerAnimation(it.url);
      prevCounts.current[it.url] = count;
    });
  }, swrList.map((s) => s.data));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0d3966] mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Real-time system statistics and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it, i) => {
          const { data, error, isLoading } = swrList[i];
          const Icon = it.icon;

          const value = isLoading
            ? "…"
            : error
            ? "—"
            : getCountFromResponse(data);

          const animate = animState[it.url];

          return (
            <div
              key={it.key}
              className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 ${
                animate
                  ? "scale-105 shadow-2xl"
                  : "scale-100"
              }`}
            >
              {/* Background Gradient Overlay */}
              <div className={`absolute inset-0 bg-linear-to-br ${it.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Card Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-linear-to-br ${it.gradient} shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon
                      className="h-6 w-6 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  
                  {/* Live Indicator */}
                  {animate && (
                    <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-700">Live</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {it.label}
                  </h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold text-[#0d3966] transition-all duration-500 ${
                      animate ? "scale-110" : "scale-100"
                    }`}>
                      {value}
                    </span>
                    
                    {data?.delta && (
                      <span className={`text-sm font-semibold ${
                        data.delta > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {data.delta > 0 ? "+" : ""}{data.delta}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Border Accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${it.gradient} transform origin-left transition-transform duration-300 ${
                  animate ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <span className="text-sm text-blue-800 flex items-center gap-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          Dashboard updates in real-time via Server-Sent Events
        </span>
      </div>
    </div>
  );
}