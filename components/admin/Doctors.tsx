"use client";

import React from "react";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";

type dept = {
  name?: string;
};

type Doctor = {
  _id?: string;
  name: string;
  email?: string;
  avatar?: string | null;
  phone?: string;
  role?: string;
  bio?: string;
  dept?: dept;
  specialty?: string;
  availability?: any;
  slug?: string;
};

type DoctorsViewProps = {
  onEdit?: (doctorId: string) => void;
};

// normalize various availability shapes into an array of lines
function formatAvailabilityLines(av: any): string[] {
  if (!av) return ["Not specified"];

  // string -> single line
  if (typeof av === "string") return [av];

  // array of strings
  if (Array.isArray(av) && av.every((x) => typeof x === "string")) {
    return av.length ? av : ["Not specified"];
  }

  if (
    Array.isArray(av) &&
    av.every((x) => typeof x === "object" && x !== null)
  ) {
    return av.map((slot: any) => {
      const day = slot.day ?? slot.label ?? slot.name ?? "?";
      const from = slot.from ?? slot.start;
      const to = slot.to ?? slot.end;
      if (from || to)
        return `${day}: ${from ?? ""}${from && to ? " - " : ""}${
          to ?? ""
        }`.trim();
      return String(day);
    });
  }

  // object keyed by days: { monday: { from, to }, tuesday: ... }
  if (typeof av === "object" && !Array.isArray(av)) {
    const keys = Object.keys(av);
    if (keys.length === 0) return ["Not specified"];
    // if values are objects with from/start keys
    if (keys.every((k) => typeof av[k] === "object" && av[k] !== null)) {
      return keys.map((k) => {
        const v = av[k];
        const from = v?.from ?? v?.start;
        const to = v?.to ?? v?.end;
        if (from || to)
          return `${k}: ${from ?? ""}${from && to ? " - " : ""}${
            to ?? ""
          }`.trim();
        return String(k);
      });
    }
  }

  // fallback: try to stringify reasonably
  try {
    return [typeof av === "object" ? JSON.stringify(av) : String(av)];
  } catch (e) {
    return ["Not specified"];
  }
}

export default function DoctorsView({ onEdit }: DoctorsViewProps = {}) {
  const router = useRouter();

  const fetcher = async (url: string) => {
    const res = await fetch(url, { cache: "no-store" }); // no-store for always-fresh client data
    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const err: any = new Error(
        data?.error || `Request failed with status ${res.status}`
      );
      err.status = res.status;
      err.info = data;
      throw err;
    }
    return data;
  };

  const {
    data: doctorsObject,
    error,
    isLoading,
    mutate,
  } = useSWR<any>("/api/admin/doctors", fetcher);

  const doctors: Doctor[] = Array.isArray(doctorsObject)
    ? doctorsObject
    : doctorsObject?.doctors || doctorsObject?.data || [];

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async (id: string) => {
    if (!id) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) throw new Error(json.error || "Delete failed");

      await mutate();
      setDeleteId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete doctor");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d3a66]">Medical Team</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your healthcare professionals
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">
              Error loading doctors
            </p>
            <p className="text-sm text-red-700 mt-1">
              {String((error as any)?.message ?? error)}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-gray-200 mb-2" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-5/6 rounded bg-gray-200" />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <div className="h-9 flex-1 rounded-lg bg-gray-200" />
                <div className="h-9 flex-1 rounded-lg bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctors Grid */}
      {!isLoading && !error && (
        <>
          {(doctors ?? []).length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors!.map((d) => (
                <div
                  key={d._id ?? d.slug ?? d.name}
                  className="group rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#0d3a66]/20 relative overflow-hidden"
                >
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#0d3a66]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Doctor Info */}
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-5">
                      {d.avatar ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-gray-100 group-hover:ring-[#0d3a66]/30 transition-all duration-300 flex-shrink-0">
                          <Image
                            src={d.avatar}
                            alt={d.name}
                            fill
                            sizes="64px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-linear-to-br from-[#0d3a66] to-[#1e5a8e] flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-100 group-hover:ring-[#0d3a66]/30 transition-all duration-300 flex-shrink-0">
                          {(() => {
                            const parts = (d.name || "?").split(" ");
                            const first = parts[0]?.[0] || "?";
                            const last = parts[parts.length - 1]?.[0] || "";
                            return `${first}${last}`.toUpperCase();
                          })()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#0d3a66] mb-1 truncate group-hover:text-[#0a2d4d] transition-colors">
                          {d.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-[#0d3a66]/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="truncate">
                            {d.dept?.name ?? "General Medicine"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {d.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {d.bio}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-[#0d3a66]/60 mt-0.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Specialty
                          </p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {d.specialty ?? "General Practice"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-[#0d3a66]/60 mt-0.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">
                            Availability
                          </p>
                          <div className="space-y-1">
                            {formatAvailabilityLines(d.availability).map(
                              (line, idx) => (
                                <p
                                  key={idx}
                                  className="text-sm font-medium text-gray-800"
                                >
                                  {line}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {d.phone && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-[#0d3a66]/60 mt-0.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">
                              Contact
                            </p>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {d.phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          const path = d.slug
                            ? `/doctors/${d.slug}`
                            : `/doctors/id/${d._id}`;
                          try {
                            router.push(path);
                          } catch (e) {
                            window.location.href = path;
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-[#0d3a66] text-white hover:bg-[#0a2d4d] transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </button>

                      <button
                        onClick={() => onEdit?.(d.slug!)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteId(d._id ?? d.slug ?? "")}
                        className="flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-gray-100 p-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No doctors found
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add doctors to your medical team to get started
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setDeleteId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Doctor
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete this doctor? This action
                  cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId!)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
