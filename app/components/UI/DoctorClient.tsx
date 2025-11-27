// components/UI/DoctorsClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Search,
  Stethoscope,
  Star,
  Award,
  HouseHeart,
  User,
} from "lucide-react";

type RawDoctor = Record<string, any>;
const THEME = "#0d3a66";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DoctorsClient({ initialData }: { initialData: RawDoctor[] }) {
  const { data, error } = useSWR("/api/doctors", fetcher, {
    fallbackData: Array.isArray(initialData) ? initialData : [],
    refreshInterval: 5000,
  });

  const raw: any[] = data?.data ?? data?.doctors ?? data ?? [];
  const [q, setQ] = useState("");

  const normalized = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const list = Array.isArray(raw) ? raw : [];

    return list
      .map((d: any) => {
        const id = d._id?.$oid ?? d._id ?? d.id ?? String(Math.random());
        const name = d.name ?? d.fullName ?? "Unknown Doctor";
        const slug =
          d.slug ??
          (typeof name === "string"
            ? name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "")
            : String(id));
        const avatar = d.avatar ?? d.photo ?? d.image ?? "/images/placeholder.jpg";
        const specialty = d.specialty ?? d.role ?? "";
        const email = d.email ?? "";
        const location = d.location ?? "Tariq Medical Centre, Kallar Syedan, Rawalpindi";
        const isPro = Boolean(d.isPro || d.pro);
        const deptName =
          d.dept?.name ??
          d.department?.name ??
          d.department ??
          d.deptName ??
          d.departmentName ??
          "";

        return {
          raw: d,
          id,
          name,
          slug,
          avatar,
          specialty,
          email,
          location,
          isPro,
          deptName,
        };
      })
      .filter((x: any) => {
        if (!ql) return true;
        return (
          x.name.toLowerCase().includes(ql) ||
          x.specialty.toLowerCase().includes(ql) ||
          x.location.toLowerCase().includes(ql) ||
          x.deptName.toLowerCase().includes(ql)
        );
      });
  }, [raw, q]);

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-3xl text-center">
          <p className="font-semibold">Failed to load doctors. Please refresh or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto mt-8 px-4 py-8">
      {/* Minimal left-aligned header: logo left, title left, search to the right (responsive) */}
      <div className="mb-8 mt-10">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/" className="shrink-0">
            <img src="/images/logo.png" alt="Tariq Medical Centre" className="w-14 h-14 object-contain" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold" style={{ color: THEME }}>
              Our Medical Experts
            </h1>
            <p className="text-sm text-gray-600">
              Meet the trusted specialists at Tariq Medical Centre — Kallar Syedan, Rawalpindi.
            </p>
          </div>

          <div className="w-full md:w-1/3 lg:w-1/4 ml-auto mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, specialty or location"
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d3a66]/30"
                aria-label="Search doctors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row (subtle) */}
      <div className="mb-6 flex items-center justify-start gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
          <Award className="w-4 h-4 text-gray-600" />
          <span className="font-semibold">{normalized.length} Specialists</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold">Expert Care</span>
        </div>
      </div>

      {/* Doctors Grid - cards slightly smaller */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {normalized.map((d: any) => (
          <Link key={d.id} href={`/doctors/${d.slug}`} className="no-underline group" aria-label={`View ${d.name}`}>
            <article className="relative rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-250 overflow-hidden group-hover:border-blue-200 h-full">
              {/* Header with gradient (slightly shorter) */}
              <div className="relative h-20 bg-linear-to-br from-[#000080] via-blue-600 to-cyan-500 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: "60px 60px",
                    }}
                  />
                </div>

                {/* Logo small in corner */}
                <img src="/images/logo.png" alt="logo" className="absolute top-3 right-3 rounded-lg w-8 h-8" />

                {/* PRO badge */}
                {d.isPro && (
                  <div className="absolute left-3 top-3 flex items-center gap-1 bg-linear-to-r from-yellow-400 to-amber-400 text-gray-900 font-bold text-xs px-2 py-1 rounded-xl shadow">
                    <Star className="w-3 h-3" />
                    <span className="text-[11px]">PRO</span>
                  </div>
                )}
              </div>

              <div className="p-4 -mt-10 relative">
                {/* Avatar smaller */}
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md bg-gray-100 group-hover:border-blue-100 transition-all">
                    <img src={d.avatar} alt={d.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-linear-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm border-2 border-white">
                    <Stethoscope className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Name and Title smaller */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#000080] transition-colors">Dr. {d.name}</h3>

                  {d.specialty && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-linear-to-br from-blue-100 to-cyan-100 rounded-md flex items-center justify-center">
                        <Award className="w-3 h-3 text-[#000080]" />
                      </div>
                      <span className="text-xs text-teal-900">Speciality:</span>{" "}
                      <span className="text-xs font-semibold text-[#000080]">{d.specialty}</span>
                    </div>
                  )}

                  {d.deptName && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-linear-to-br from-blue-100 to-cyan-100 rounded-md flex items-center justify-center">
                        <HouseHeart className="w-3 h-3 text-[#000080]" />
                      </div>
                      <span className="text-xs text-teal-900">Dept:</span>{" "}
                      <span className="text-xs font-semibold text-[#000080]">{d.deptName}</span>
                    </div>
                  )}

                  {d.email && <div className="text-xs text-gray-500 truncate">{d.email}</div>}
                </div>

                {/* Skills/Tags smaller */}
                {(d.specialty || (Array.isArray(d.raw?.skills) && d.raw.skills.length > 0)) && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {d.specialty && (
                      <span className="text-xs font-medium px-2 py-1 bg-linear-to-br from-blue-50 to-cyan-50 text-[#000080] rounded-full border border-blue-200">{d.specialty}</span>
                    )}
                    {Array.isArray(d.raw?.skills) && d.raw.skills.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">{s}</span>
                    ))}
                  </div>
                )}

                {/* View Profile button */}
                <button className="w-full mt-2 flex items-center justify-center gap-2 bg-linear-to-r from-[#000080] to-blue-600 text-white font-bold py-2 px-3 rounded-xl hover:shadow-md transition-all group-hover:scale-102">
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-sm">View Profile</span>
                </button>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {normalized.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-linear-to-br from-gray-100 to-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </section>
  );
}
