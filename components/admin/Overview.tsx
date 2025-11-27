// components/admin/AdminOverviewRealtime.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { StatCard } from "@/components/admin/Component"; // if unused, remove import

import {
  Box,
  CalendarCheck,
  Users,
  FileText,
  Briefcase,
  Layers
} from "lucide-react";

const resources = [
  { key: "products", label: "Pharmacy Products", icon: Box },
  { key: "appointments", label: "Appointments Today", icon: CalendarCheck },
  { key: "doctors", label: "Active Doctors", icon: Users },
  { key: "prescriptions", label: "Prescriptions", icon: FileText },
  { key: "services", label: "Services", icon: Briefcase },
  { key: "departments", label: "Departments", icon: Layers },
];

// fetcher left as-is
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
  if (typeof res.count === "number") return res.count;
  if (typeof res.total === "number") return res.total;
  if (Array.isArray(res)) return res.length;
  if (Array.isArray(res.data)) return res.data.length;
  if (Array.isArray(res.items)) return res.items.length;
  for (const k of Object.keys(res)) if (Array.isArray(res[k])) return res[k].length;
  return 0;
}

export default function AdminOverviewRealtime() {
  const items = resources.map((r) => ({ ...r, url: `/api/admin/${r.key}` }));

  // create swr hooks in stable order
  const swrList = items.map((it) =>
    useSWR(it.url, fetcher, { revalidateOnFocus: true, refreshInterval: 0 })
  );

  // track ES objects & poll timers
  const esRefs = useRef<Record<string, EventSource | null>>({});
  const pollRefs = useRef<Record<string, number | null>>({});
  const prevCounts = useRef<Record<string, number>>({});
  const [liveMap, setLiveMap] = useState<Record<string, boolean>>({});

  // small helper to trigger live highlight
  function triggerLive(url: string) {
    setLiveMap((s) => ({ ...s, [url]: true }));
    window.setTimeout(() => setLiveMap((s) => ({ ...s, [url]: false })), 700);
  }

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    items.forEach((it) => {
      const url = it.url;
      const streamUrl = url; // we assume same endpoint might support SSE or not

      // ensure any previous timers/es closed for this url
      if (esRefs.current[url]) {
        try { esRefs.current[url]?.close(); } catch {}
        esRefs.current[url] = null;
      }
      if (pollRefs.current[url]) {
        clearInterval(pollRefs.current[url] as number);
        pollRefs.current[url] = null;
      }

      // asynchronous setup per resource
      (async () => {
        let useSSE = false;

        try {
          // try HEAD to inspect content-type without subscribing
          // many endpoints support HEAD; if not supported, this will likely throw or return non-ok
          const head = await fetch(streamUrl, {
            method: "HEAD",
            credentials: "same-origin",
            cache: "no-store",
          });

          if (head.ok) {
            const ct = head.headers.get("content-type") || "";
            if (ct.includes("text/event-stream")) {
              useSSE = true;
            }
          } else {
            // HEAD returned non-ok (405/403/...), fall back to polling
            useSSE = false;
          }
        } catch (err) {
          // network/HEAD not allowed -> fallback to polling
          useSSE = false;
        }

        if (useSSE && typeof EventSource !== "undefined") {
          try {
            const es = new EventSource(streamUrl, { withCredentials: true } as EventSourceInit);
            esRefs.current[url] = es;

            const onMessage = (ev: MessageEvent) => {
              // server signalled something changed; revalidate SWR
              mutate(url).then(() => triggerLive(url));
            };
            const onError = () => {
              // close and fallback to polling on error
              try { es.close(); } catch {}
              esRefs.current[url] = null;

              // start polling fallback
              pollRefs.current[url] = window.setInterval(() => {
                mutate(url).then(() => triggerLive(url));
              }, 30000);
            };

            es.addEventListener("message", onMessage);
            es.addEventListener("error", onError);

            // cleanup push
            cleanups.push(() => {
              try { es.removeEventListener("message", onMessage); } catch {}
              try { es.removeEventListener("error", onError); } catch {}
              try { es.close(); } catch {}
            });

            return;
          } catch (err) {
            // if creating EventSource throws, fall through to polling fallback
            esRefs.current[url] = null;
          }
        }

        // Polling fallback: mutate every 30s
        pollRefs.current[url] = window.setInterval(() => {
          mutate(url).then(() => triggerLive(url));
        }, 30000);

        cleanups.push(() => {
          if (pollRefs.current[url]) {
            clearInterval(pollRefs.current[url] as number);
            pollRefs.current[url] = null;
          }
        });
      })();
    });

    return () => {
      // global cleanup
      Object.values(esRefs.current).forEach((es) => {
        try { es?.close(); } catch {}
      });
      Object.values(pollRefs.current).forEach((t) => {
        if (t) clearInterval(t);
      });
      cleanups.forEach((c) => {
        try { c(); } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // watch swr data changes to animate when count changes
  useEffect(() => {
    items.forEach((it, i) => {
      const data = swrList[i].data;
      const count = getCountFromResponse(data);
      const prev = prevCounts.current[it.url];
      if (prev !== undefined && prev !== count) {
        triggerLive(it.url);
      }
      prevCounts.current[it.url] = count;
    });
    // We intentionally depend on each SWR data item
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, swrList.map((s) => s.data));

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#0d3966] mb-1">Dashboard Overview</h2>
        <p className="text-sm text-gray-600">Realtime system statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => {
          const { data, error, isLoading } = swrList[i];
          const Icon = it.icon;

          const value = isLoading ? "…" : error ? "—" : getCountFromResponse(data);
          const live = !!liveMap[it.url];

          return (
            <div
              key={it.key}
              className={`relative overflow-hidden rounded-lg bg-white border border-gray-100 p-4 transition-transform duration-200 ${live ? "ring-2 ring-green-200 scale-101" : ""}`}
              role="group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-[#0d3966]/10">
                    <Icon className="h-5 w-5 text-[#0d3966]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {it.label}
                    </div>
                    <div className="mt-1 text-xl font-semibold text-[#0d3966]">{value}</div>
                  </div>
                </div>

                {live && (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-700 font-medium">Live</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Dashboard updates via SSE when available, otherwise falls back to polling every 30s.
      </div>
    </div>
  );
}
