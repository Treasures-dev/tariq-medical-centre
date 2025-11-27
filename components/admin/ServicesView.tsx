// components/admin/ServicesView.tsx
"use client";

import useSWR, { mutate } from "swr";
import React, { useMemo, useState } from "react";

type Service = {
  _id?: string;
  title: string;
  slug?: string;
  price?: number;
  durationMinutes?: number;
  description?: string;
  image?: string;
  onOffer?: boolean;
  offerPrice?: number;
  installmentAvailable?: boolean;
  createdAt?: string | { $date?: string };
  code?: string;
};

type Props = {
  onEdit?: (slug: string) => void;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ServicesView({ onEdit }: Props) {
  // ---- hooks (always called, in same order) ----
  const { data, error, isLoading } = useSWR<{ data?: Service[]; services?: Service[] }>(
    "/api/admin/services",
    fetcher,
    { revalidateOnFocus: true }
  );

  const [deleting, setDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<
    "name-asc" | "name-desc" | "price-desc" | "price-asc" | "newest"
  >("name-asc");

  // normalize services array (safe even if data is undefined)
  const services: Service[] = (data?.data ?? data?.services ?? []) as Service[];

  // compute filtered & sorted list using useMemo (always called)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = services.filter((s) => {
      if (!q) return true;
      return (
        (s.title ?? "").toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q)
      );
    });

    arr = arr.sort((a, b) => {
      if (sort === "name-asc") return (a.title ?? "").localeCompare(b.title ?? "");
      if (sort === "name-desc") return (b.title ?? "").localeCompare(a.title ?? "");
      if (sort === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
      if (sort === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "newest") {
        const aDate = a.createdAt ? new Date((a.createdAt as any).$date ?? a.createdAt) : new Date(0);
        const bDate = b.createdAt ? new Date((b.createdAt as any).$date ?? b.createdAt) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      }
      return 0;
    });

    return arr;
  }, [services, query, sort]);

  // ---- handlers (defined after hooks) ----
  async function handleDelete(slugOrId?: string) {
    if (!slugOrId) return;
    const ok = window.confirm("Are you sure you want to delete this service? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeleting(slugOrId);
      const res = await fetch(`/api/admin/services/${slugOrId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      await mutate("/api/admin/services");
    } catch (err: any) {
      console.error("Failed to delete service:", err);
      alert(err?.message || "Failed to delete service");
    } finally {
      setDeleting(null);
    }
  }

  // ---- rendering: show loading/error/info after hooks have run ----
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0d3a66]">Services</h3>
          <p className="text-sm text-gray-500">Manage treatments, durations, prices and offers.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services or description..."
            className="w-full sm:w-[320px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0d3a66]"
          />

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "name-asc" | "name-desc" | "price-desc" | "price-asc" | "newest")
            }
            className="px-3 py-2 rounded-md border border-gray-200 bg-white"
            aria-label="Sort services"
          >
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="price-desc">Price (high → low)</option>
            <option value="price-asc">Price (low → high)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* status messages */}
      {isLoading && <div className="text-sm text-gray-600 mb-4">Loading services...</div>}
      {error && <div className="text-sm text-red-600 mb-4">Failed to load services</div>}

      <div className="space-y-4">
        {filtered.length === 0 && !isLoading && !error && (
          <p className="text-gray-500">No services found</p>
        )}

        {filtered.map((svc) => {
          const slug = svc.slug ?? svc._id;
          const priceLabel = typeof svc.price === "number" ? `PKR ${svc.price.toLocaleString()}` : "—";
          const offerLabel = svc.onOffer && typeof svc.offerPrice === "number" ? `Offer: PKR ${svc.offerPrice.toLocaleString()}` : null;
          const createdAt = svc.createdAt && (svc.createdAt as any).$date ? new Date((svc.createdAt as any).$date) : svc.createdAt ? new Date(svc.createdAt as any) : null;

          return (
            <div key={slug} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-4">
                <div className="flex items-start gap-4 w-full">
                  {/* image */}
                  <div className="h-16 w-20 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    {svc.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={svc.image} alt={svc.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{svc.title}</h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl line-clamp-2">
                      {svc.description ?? "No description"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-[#0d3a66] font-semibold">{priceLabel}</span>

                      {offerLabel && (
                        <span className="text-sm text-white bg-red-600 px-2 py-0.5 rounded-md font-medium">
                          {offerLabel}
                        </span>
                      )}

                      {typeof svc.durationMinutes === "number" && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {svc.durationMinutes} min
                        </span>
                      )}

                      {svc.installmentAvailable && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          Installments
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(slug as string)}
                    disabled={deleting !== null}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0d3a66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(slug as string)}
                    disabled={deleting === slug}
                    aria-label={`Delete ${svc.title}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting === slug ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {/* meta row */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <div>
                  <strong className="text-gray-700">Created:</strong>{" "}
                  {createdAt ? createdAt.toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
