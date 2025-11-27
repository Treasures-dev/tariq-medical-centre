// components/UI/DepartmentListClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Search, Award, Star, HouseHeart, MapPin } from "lucide-react";

type DeptRaw = Record<string, any>;
type Dept = {
  raw?: DeptRaw;
  id: string;
  name: string;
  slug: string;
  description?: string;
  photo?: string;
  isFeatured?: boolean;
  location?: string;
};

const THEME = "#0d3a66";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DepartmentListClient({ initialData }: { initialData?: DeptRaw[] | Dept[] }) {
  const { data, error } = useSWR("/api/departments", fetcher, {
    fallbackData: Array.isArray(initialData) ? initialData : undefined,
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const rawList: any[] = data?.departments ?? data?.data ?? data ?? [];
  const [q, setQ] = useState("");

  const departments: Dept[] = useMemo(() => {
    const list = Array.isArray(rawList) ? rawList : [];
    const ql = q.trim().toLowerCase();

    return list
      .map((d: any) => {
        const id = d._id?.$oid ?? d._id ?? d.id ?? String(Math.random());
        const name = d.name ?? d.title ?? "Unnamed Department";
        const slug = d.slug ?? name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
        const photo = d.photo ?? d.image ?? d.avatar ?? "/images/placeholder.jpg";
        const description = d.description ?? d.summary ?? d.about ?? "";
        const isFeatured = Boolean(d.isFeatured || d.featured || d.pro);
        const location = d.location ?? d.hospital ?? "Tariq Medical Centre";

        return { raw: d, id, name, slug, photo, description, isFeatured, location };
      })
      .filter((dept) =>
        !ql
          ? true
          : dept.name.toLowerCase().includes(ql) ||
            (dept.description ?? "").toLowerCase().includes(ql) ||
            (dept.location ?? "").toLowerCase().includes(ql)
      );
  }, [rawList, q]);

  const featuredCount = departments.filter((d) => d.isFeatured).length;

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-3xl text-center">
          <p className="font-semibold">Failed to load departments. Try again later.</p>
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
              Departments
            </h1>
            <p className="text-sm text-gray-600">
              Explore specialized departments at Tariq Medical Centre
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
          <Award className="w-4 h-4 text-[#0d3a66]" />
          <span className="font-semibold">{departments.length} Departments</span>
        </div>
    
      </div>

      {/* Grid - slightly more compact cards with soft glassy backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!data || departments.length === 0) ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/40 p-0 h-48" />
          ))
        ) : (
          departments.map((dept) => (
            <Link key={dept.id} href={`/departments/${dept.slug}`} className="group">
              <article className="relative rounded-2xl bg-white/70 backdrop-blur-md border border-white/30 shadow-md hover:shadow-lg transition duration-300 overflow-hidden">

                <div className="relative h-28 bg-gray-100 overflow-hidden">
                  <img src={dept.photo} alt={dept.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                  {dept.isFeatured && (
                    <div className="absolute left-3 top-3 bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1.5 rounded-xl shadow border">
                      <Star className="w-3 h-3 inline" /> Featured
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold" style={{ color: THEME }}>{dept.name}</h3>

                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span>{dept.location}</span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{dept.description ?? "Specialized care and services."}</p>

                  <div className="mt-3 text-xs font-semibold text-[#0d3a66] flex justify-between items-center">
                    <span>View details</span>
                    <span className="text-gray-400">&gt;</span>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
