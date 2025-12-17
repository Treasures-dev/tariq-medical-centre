// components/UI/ServicesClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Search, Star, DollarSign, Stethoscope } from "lucide-react";

type ServiceRaw = Record<string, any>;
type Service = {
  raw?: ServiceRaw;
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  price?: number;
  durationMinutes?: number;
  onOffer?: boolean;
  installmentAvailable?: boolean;
};

const THEME = "#0d3a66";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ServicesClient({ initialData }: { initialData?: ServiceRaw[] | Service[] }) {
  const { data, error } = useSWR("/api/services", fetcher, {
    fallbackData: Array.isArray(initialData) ? initialData : undefined,
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const rawList: any[] = data?.services ?? data?.data ?? data ?? [];
  const [q, setQ] = useState("");

  const services: Service[] = useMemo(() => {
    const list = Array.isArray(rawList) ? rawList : [];
    const ql = q.trim().toLowerCase();

    return list
      .map((s: any) => {
        const id = s._id?.$oid ?? s._id ?? s.id ?? String(Math.random());
        const title = s.title ?? s.name ?? "Untitled Service";
        const slug = s.slug ?? title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
        const image = s.image ?? s.photo ?? s.avatar ?? "/images/service-placeholder.jpg";
        const description = s.description ?? s.summary ?? s.about ?? "";
        const price = typeof s.price === "number" ? s.price : (s.price ? Number(s.price) : undefined);
        const durationMinutes = s.durationMinutes ?? s.duration ?? undefined;
        const onOffer = Boolean(s.onOffer || s.offer);
        const installmentAvailable = Boolean(s.installmentAvailable || s.installmentOptions);

        return { raw: s, id, title, slug, image, description, price, durationMinutes, onOffer, installmentAvailable };
      })
      .filter((svc) =>
        !ql
          ? true
          : svc.title.toLowerCase().includes(ql) ||
            (svc.description ?? "").toLowerCase().includes(ql)
      );
  }, [rawList, q]);

  const offerCount = services.filter((s) => s.onOffer).length;

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-3xl text-center">
          <p className="font-semibold">Failed to load services. Try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto mt-6 px-4 py-8">

  {/* ⭐ MINIMAL LEFT HEADER (logo left, title left, search right) ⭐ */}
  <div className="mb-8 mt-10">
        <div className="flex items-center gap-4 flex-wrap">
          <img
            src="/images/logo.png"
            alt="Tariq Medical Centre"
            className="w-14 h-14 rounded-2xl object-contain"
          />

          <div>
            <h1 className="text-2xl font-bold" style={{ color: THEME }}>
              Services
            </h1>
            <p className="text-sm text-gray-600">
              Explore specialized services at Tariq Medical Centre
            </p>
          </div>

          <div className="w-full md:w-1/3 lg:w-1/4 mt-4 md:mt-0 ml-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search departments..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d3a66]/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
          <Stethoscope className="w-4 h-4 text-[#0d3a66]" />
          <span className="font-semibold">{services.length} Services</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">{offerCount} On Offer</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!data || services.length === 0)
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/40 h-48" />
            ))
          : services.map((svc) => (
              <Link key={svc.id} href={`/healthcare/${svc.slug}`} className="group">
                <article className="relative rounded-2xl bg-white/70 backdrop-blur-md border border-white/30 shadow-md hover:shadow-lg transition overflow-hidden">

                  <div className="relative h-28 bg-gray-100 overflow-hidden">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {svc.onOffer && (
                      <div className="absolute left-3 top-3 bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow border">
                        Offer
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold" style={{ color: THEME }}>
                      {svc.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <DollarSign className="w-3 h-3 text-gray-500" />
                      <span>
                        {typeof svc.price === "number"
                          ? `PKR ${svc.price.toLocaleString()}`
                          : "Price on request"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                      {svc.description ?? "Service details and packages."}
                    </p>

                    <div className="mt-3 text-xs font-semibold text-[#0d3a66] flex justify-between items-center">
                      <span>View details</span>
                      <span className="text-gray-400">&gt;</span>
                    </div>
                  </div>

                </article>
              </Link>
            ))}
      </div>

    </section>
  );
}
