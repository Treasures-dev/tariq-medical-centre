"use client";

import useSWR, { mutate } from "swr";
import React, { useMemo, useState } from "react";

type Doctor = {
  _id: string;
  name: string;
  avatar?: string;
  specialty?: string;
};

type Department = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  photo?: string;
  doctors: Doctor[];
  createdAt?: string | { $date?: string };
};

type Props = {
  onEdit?: (slug: string) => void;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DepartmentsView({ onEdit }: Props) {
  // --- Hooks: ALWAYS call these before any early returns ---
  const { data, error, isLoading } = useSWR<{ departments?: Department[] }>(
    "/api/admin/departments",
    fetcher,
    { revalidateOnFocus: true }
  );

  const [deleting, setDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<
    "name-asc" | "name-desc" | "doctors" | "newest"
  >("name-asc");

  // Derived data (hook) — also must be called unconditionally
  const departments = data?.departments ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // make a shallow copy before sorting to avoid mutating original array
    let arr = departments.filter((d) => {
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q)
      );
    });

    // copy before sort so we don't mutate `departments`
    arr = [...arr];

    arr.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "doctors")
        return (b.doctors?.length ?? 0) - (a.doctors?.length ?? 0);
      if (sort === "newest") {
        const aDate = a.createdAt
          ? new Date((a.createdAt as any).$date ?? a.createdAt)
          : new Date(0);
        const bDate = b.createdAt
          ? new Date((b.createdAt as any).$date ?? b.createdAt)
          : new Date(0);
        return bDate.getTime() - aDate.getTime();
      }
      return 0;
    });

    return arr;
  }, [departments, query, sort]);

  // --- Now it's safe to do early returns based on data ---
  if (isLoading) return <p>Loading departments...</p>;
  if (error) return <p className="text-red-600">Failed to load departments</p>;

  // rest of component (unchanged)
  async function handleDelete(slug: string) {
    const ok = window.confirm(
      "Are you sure you want to delete this department? This will unassign doctors from this department."
    );
    if (!ok) return;

    try {
      setDeleting(slug);
      const res = await fetch(`/api/admin/departments/${slug}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      // refresh list
      await mutate("/api/admin/departments");
    } catch (err: any) {
      console.error("Failed to delete department:", err);
      alert(err?.message || "Failed to delete department");
    } finally {
      setDeleting(null);
    }
  }


  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0d3a66]">Departments</h3>
          <p className="text-sm text-gray-500">
            Manage hospital departments and assign doctors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search departments, descriptions..."
            className="w-full sm:w-[300px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0d3a66]"
          />

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "name-asc" | "name-desc" | "doctors" | "newest")
            }
            className="px-3 py-2 rounded-md border border-gray-200 bg-white"
            aria-label="Sort departments"
          >
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="doctors">Doctors (most)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-gray-500">No departments found</p>
        )}

        {filtered.map((dep) => {
          const createdAt =
            dep.createdAt && (dep.createdAt as any).$date
              ? new Date((dep.createdAt as any).$date)
              : dep.createdAt
              ? new Date(dep.createdAt as any)
              : null;

          return (
            <div
              key={dep._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-4">
                <div className="flex items-start gap-4 w-full">
                  {/* Department image */}
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    {dep.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dep.photo}
                        alt={dep.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{dep.name}</h4>
                    {dep.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {dep.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-sm text-gray-500">
                        <strong className="text-gray-800">{dep.doctors.length}</strong>{" "}
                        Doctors
                      </span>

                      {createdAt && (
                        <span className="text-sm text-gray-500">
                          Created: {createdAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(dep.slug)}
                    disabled={deleting !== null}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0d3a66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(dep.slug)}
                    disabled={deleting === dep.slug}
                    aria-label={`Delete ${dep.name}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting === dep.slug ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {/* Doctors row */}
              <div className="flex flex-wrap gap-3 mt-2">
                {dep.doctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 shrink-0">
                      {doc.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {doc.name}
                      </span>
                      <span className="text-sm text-teal-300">
                        {doc.specialty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
