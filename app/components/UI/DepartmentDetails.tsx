"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { Star, MapPin, User } from "lucide-react";

type DeptDetail = {
  _id?: any;
  name: string;
  slug?: string;
  photo?: string;
  description?: string;
  contactPhone?: string;
  head?: string;
  doctors?: { _id?: any; name?: string; slug?: string; avatar?: string }[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const THEME = "#0d3a66";

type Props = {
  slug: string;
  initialData?: any; // server-provided fallback (optional)
};

export default function DepartmentDetailsClient({ slug, initialData }: Props) {
  const endpoint = slug ? `/api/departments/${slug}` : null;

  // Normalize fallback shape: allow { department: {...} } or direct dept object
  const fallback = initialData
    ? (initialData.department ?? initialData)
    : undefined;

  const { data, error } = useSWR(endpoint, fetcher, {
    fallbackData: fallback,
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  // Normalize department shapes
  let dept: DeptDetail | null = null;
  if (data) {
    if (data.department) dept = data.department;
    else if (data.data && !Array.isArray(data.data)) dept = data.data;
    else if (data.departments && Array.isArray(data.departments)) dept = data.departments[0];
    else if (!Array.isArray(data)) dept = data;
  }

  if (!slug) return <div className="p-6 text-center text-sm text-gray-500">No department specified.</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load department.</div>;

  // Loading skeleton
  if (!data)
    return (
      <div className="animate-pulse max-w-4xl mx-auto mt-12">
        <div className="h-56 bg-white/60 rounded-2xl" />
      </div>
    );

  if (!dept) return <div className="p-6 text-center text-sm text-gray-500">Department not found.</div>;

  return (
    // Page background subtle gradient
    <div className="min-h-screen">
      <main className="max-w-5xl mt-20 mx-auto px-4 py-12">
        {/* Glassy card */}
        <article className="relative rounded-2xl  backdrop-blur-md border  shadow-lg overflow-hidden">
          {/* Top-right logo */}
          <img
            src="/images/logo.png"
            alt="Tariq Medical Centre"
            className="absolute top-4 right-4 w-12 h-12 rounded-lg bg-white/60 p-1 shadow-md z-20 object-contain"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Left - image + contact */}
            <div>
              <div className="overflow-hidden rounded-xl shadow-md">
                <img src={dept.photo ?? "/images/placeholder.jpg"} alt={dept.name} className="w-full h-56 object-cover" />
              </div>

              <div className="mt-4 text-sm text-[#0d3a66]">
              

                <div className="mt-4">
                  <button className="w-full px-4 py-2 rounded-lg font-semibold text-white" style={{ background: THEME }}>
                    Book Appointment
                  </button>
                  <Link href="/contact">
                    <span className="block w-full text-center mt-2 px-4 py-2 rounded-lg border" style={{ borderColor: THEME, color: THEME }}>
                      Contact Us
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right - main content */}
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold" style={{ color: THEME }}>{dept.name}</h1>
              <p className="mt-3 text-sm text-gray-700">{dept.description ?? "No description available."}</p>

              {/* Doctors list */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold" style={{ color: THEME }}>Our Doctors</h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.isArray(dept.doctors) && dept.doctors.length ? (
                    dept.doctors.map((doc) => (
                      <Link key={doc._id ?? doc.slug ?? doc.name} href={`/doctors/${doc.slug ?? doc._id}`}>
                        <span className="block">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-white/30 hover:shadow-md transition">
                            <img src={doc.avatar ?? "/images/doctor-placeholder.jpg"} alt={doc.name} className="w-12 h-12 rounded-full object-cover border" />
                            <div className="flex-1">
                              <div className="font-medium" style={{ color: THEME }}>{doc.name}</div>
                              <div className="text-xs text-gray-600">View profile &amp; book</div>
                            </div>
                            <div className="text-xs text-gray-400">&gt;</div>
                          </div>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No doctors listed.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
