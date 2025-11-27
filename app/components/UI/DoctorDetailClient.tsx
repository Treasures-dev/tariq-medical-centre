"use client";

import React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Stethoscope, User, Calendar } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DoctorDetailsClient({
  slug,
  initialData,
}: {
  slug: string;
  initialData?: any;
}) {
  const { data, error } = useSWR(
    slug ? `/api/doctors/${slug}` : null,
    fetcher,
    {
      fallbackData: initialData ? initialData.doctor ?? initialData : undefined,
      refreshInterval: 5000,
    }
  );

  const router = useRouter();

  if (!slug)
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        No doctor specified.
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-red-500">Failed to load doctor.</div>
    );
  if (!data)
    return (
      <div className="p-6 animate-pulse">
        <div className="h-40 bg-white rounded-lg shadow" />
      </div>
    );

  const d = data?.doctor ?? data ?? null;
  if (!d)
    return (
      <div className="p-6 text-sm text-gray-500">Doctor not found.</div>
    );

  const id = d._id?.$oid ?? d._id ?? d.id ?? "";
  const name = d.name ?? "Unknown";
  const avatar = d.avatar ?? d.photo ?? d.image ?? "/images/placeholder.jpg";
  const specialty = d.specialty ?? "";
  const deptName = d.dept?.name;
  const deptSlug = d.dept?.slug;

  

  
  const bio = d.bio ?? "";
  const phone = d.phone ?? "";
  const email = d.email ?? "";
  const qualifications: string[] = Array.isArray(d.qualifications)
    ? d.qualifications
    : [];
  const services: any[] = Array.isArray(d.services) ? d.services : [];
  const availability: any[] = Array.isArray(d.availability) ? d.availability : [];
  const createdAt = d.createdAt?.$date ?? d.createdAt ?? null;

  return (
    <article className="w-full max-w-4xl mx-auto mt-20 bg-white rounded-3xl shadow-xl border p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="md:w-44 shrink-0">
          <img
            src={avatar}
            alt={name}
            className="w-44 h-44 object-cover rounded-2xl border shadow-sm"
          />
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Dr. {name}
              </h1>
              {specialty && (
                <p className="text-sm text-gray-600 mt-1">{specialty}</p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              {createdAt && (
                <div className="text-xs text-gray-500">
                  Joined: {new Date(createdAt).toLocaleDateString()}
                </div>
              )}
              <button
                onClick={() => router.push(`/doctors/${slug}/book`)}
                className="mt-2 px-4 py-2 rounded-2xl bg-[#f0f4ff] text-[#0d3966] font-semibold hover:shadow-lg transition-all"
              >
                <Stethoscope className="inline w-4 h-4 mr-1" />
                Book Appointment
              </button>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">{bio}</p>
          )}

          {/* Contact Info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">Phone</div>
              <div className="font-medium text-[#0d3966]">{phone || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="font-medium text-[#0d3966]">{email || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Qualifications</div>
              <div className="font-medium text-[#0d3966]">
                {qualifications.length ? qualifications.join(", ") : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Department</div>
              <Link href={`/departments/${deptSlug}`}>
              <div className="font-medium text-[#0d3966]">
               {deptName}
              </div>
              </Link>
            </div>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#0d3966]">Services</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-2xl bg-[#f0f4ff] text-[#0d3966] font-medium"
                  >
                    {s.name}
                    {s.price ? ` • PKR ${s.price}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {availability.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#0d3966]">Availability</h3>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                {availability.map((a, i) => {
                  const day = a.day ?? a.weekday ?? "Day";
                  const from = a.from ?? "—";
                  const to = a.to ?? "—";
                  return (
                    <div
                      key={i}
                      className="px-2 py-1 rounded-2xl bg-[#f0f4ff] text-[#0d3966] border border-[#c5d0e6]"
                    >
                      <div className="font-medium text-xs">{day}</div>
                      <div className="text-xs">{from} — {to}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
