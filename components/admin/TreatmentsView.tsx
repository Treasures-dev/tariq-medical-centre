"use client";

import useSWR, { mutate } from "swr";
import React, { useMemo, useState } from "react";

type Treatment = {
  _id?: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  diagnosis?: string;
  notes?: string;
  status?: string;
  createdAt?: string | { $date?: string };
  plan?: Array<{ step?: string; date?: string }>;
};

type Props = {
  onEdit?: (id: string) => void;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OngoingTreatmentsView({ onEdit }: Props) {
  const { data, error, isLoading } = useSWR<{ data?: Treatment[]; treatments?: Treatment[] }>(
    "/api/admin/treatments",
    fetcher,
    { revalidateOnFocus: true }
  );

  // fallback to non-admin endpoint if your backend uses that
  // (SWR will first try admin endpoint; if it returns undefined, user can call mutate with correct key)
  // const { data: fallback } = useSWR("/api/treatments", fetcher);

  const [deleting, setDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "patient-asc" | "patient-desc" | "status">("newest");

  const treatments: Treatment[] = (data?.data ?? data?.treatments ?? []) as Treatment[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = treatments.filter((t) => {
      if (!q) return true;
      return (
        (t.patientName ?? "").toLowerCase().includes(q) ||
        (t.doctorName ?? "").toLowerCase().includes(q) ||
        (t.diagnosis ?? "").toLowerCase().includes(q)
      );
    });

    arr = arr.sort((a, b) => {
      if (sort === "patient-asc") return (a.patientName ?? "").localeCompare(b.patientName ?? "");
      if (sort === "patient-desc") return (b.patientName ?? "").localeCompare(a.patientName ?? "");
      if (sort === "status") return (a.status ?? "").localeCompare(b.status ?? "");
      // newest
      const aDate = a.createdAt ? new Date((a.createdAt as any).$date ?? a.createdAt) : new Date(0);
      const bDate = b.createdAt ? new Date((b.createdAt as any).$date ?? b.createdAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return arr;
  }, [treatments, query, sort]);

  async function handleDelete(id?: string) {
    if (!id) return;
    const ok = window.confirm("Are you sure you want to delete this treatment record? This cannot be undone.");
    if (!ok) return;

    try {
      setDeleting(id);
      const res = await fetch(`/api/admin/treatments/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      await mutate("/api/admin/treatments");
    } catch (err: any) {
      console.error("Failed to delete treatment:", err);
      alert(err?.message || "Failed to delete treatment");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0d3a66]">Ongoing Treatments</h3>
          <p className="text-sm text-gray-500">Manage treatments currently in progress.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, doctor or diagnosis..."
            className="w-full sm:w-[320px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0d3a66]"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white"
            aria-label="Sort treatments"
          >
            <option value="newest">Newest</option>
            <option value="patient-asc">Patient A → Z</option>
            <option value="patient-desc">Patient Z → A</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="text-sm text-gray-600 mb-4">Loading treatments...</div>}
      {error && <div className="text-sm text-red-600 mb-4">Failed to load treatments</div>}

      <div className="space-y-4">
        {filtered.length === 0 && !isLoading && !error && (
          <p className="text-gray-500">No ongoing treatments found</p>
        )}

        {filtered.map((t) => {
          const id = t._id ?? `${t.patientId}-${t.doctorId ?? "x"}`;
          const createdAt = t.createdAt && (t.createdAt as any).$date ? new Date((t.createdAt as any).$date) : t.createdAt ? new Date(t.createdAt as any) : null;
          const planCount = Array.isArray(t.plan) ? t.plan.length : 0;

          return (
            <div key={id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-4">
                <div className="flex items-start gap-4 w-full">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">
                      {t.patientName ?? "Unknown patient"}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl line-clamp-2">
                      {t.diagnosis ?? "No diagnosis provided"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-[#0d3a66] font-semibold">{t.doctorName ?? t.doctorId ?? "—"}</span>

                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {planCount} steps
                      </span>

                      {t.status && (
                        <span className="text-xs text-white bg-indigo-600 px-2 py-0.5 rounded-md font-medium">
                          {t.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(id as string)}
                    disabled={deleting !== null}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0d3a66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(id as string)}
                    disabled={deleting === id}
                    aria-label={`Delete treatment ${id}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting === id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <div>
                  <strong className="text-gray-700">Started:</strong>{" "}
                  {createdAt ? createdAt.toLocaleDateString() : "—"}
                </div>
                <div>
                  <strong className="text-gray-700">Patient ID:</strong> {t.patientId ?? "—"}
                </div>
                <div>
                  <strong className="text-gray-700">Doctor ID:</strong> {t.doctorId ?? "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
