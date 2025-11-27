"use client";

import React from "react";
import useSWR from "swr";
import { SuseFont } from "@/lib/utils";
import { useEdgeStore } from "@/lib/edgestore/edgestore";

type RawId = { $oid?: string } | string;
type ApplicantServerShape = {
  _id: RawId;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  fileUrl?: string;
  createdAt?: string | { $date?: string };
  updatedAt?: string | { $date?: string };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function extractId(raw: RawId | undefined): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  return raw.$oid;
}

function parseDate(d?: string | { $date?: string } | undefined): Date | null {
  if (!d) return null;
  if (typeof d === "string") return new Date(d);
  if (typeof d === "object" && (d as any).$date)
    return new Date((d as any).$date);
  return null;
}

export default function JobsApplicationsView() {
  const { data, error, isLoading, mutate } = useSWR<{
    ok: boolean;
    data: ApplicantServerShape[];
  }>("/api/admin/resumes", fetcher);


  if (isLoading) return <p>Loading applications...</p>;
  if (error) return <p className="text-red-600">Failed to load applications</p>;



  const apps = data?.data ?? [];

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Delete this application?")) return;
    try {
      const resp = await fetch(`/api/admin/resumes/${id}`, {
        method: "DELETE",
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || "Failed");
      mutate();

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-[#0d3a66] mb-4">
        Job Applications
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 pr-4 font-semibold text-gray-700">Name</th>
              <th className="pb-3 pr-4 font-semibold text-gray-700">Email</th>
              <th className="pb-3 pr-4 font-semibold text-gray-700">Phone</th>
              <th className="pb-3 pr-4 font-semibold text-gray-700">
                Department
              </th>
              <th className="pb-3 pr-4 font-semibold text-gray-700">Applied</th>
              <th className="pb-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {apps.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No applications found
                </td>
              </tr>
            )}

            {apps.map((aRaw) => {
              const id =
                extractId(aRaw._id) ?? Math.random().toString(36).slice(2);
              const name = aRaw.name ?? "—";
              const email = aRaw.email ?? "—";
              const phone = aRaw.phone ?? "—";
              const fileLink = aRaw.fileUrl ?? "_";
              const dept = aRaw.department ?? "—";
              const dateObj = parseDate(aRaw.createdAt as any);
              const dateDisplay = dateObj
                ? dateObj.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr
                  key={id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 pr-4 text-gray-900 font-medium">
                    {name}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{email}</td>
                  <td className="py-3 pr-4 text-gray-700">{phone}</td>
                  <td className="py-3 pr-4 text-gray-700">{dept}</td>
                  <td className="py-3 pr-4 text-gray-700">{dateDisplay}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {aRaw.fileUrl ? (
                        <a
                          href={aRaw.fileUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-[#0d3966] text-[#0d3966] hover:bg-[#0d3966] hover:text-white transition-colors"
                        >
                          View CV
                        </a>
                      ) : (
                        <button
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-gray-300 text-gray-700"
                          disabled
                        >
                          No CV
                        </button>
                      )}

                      <button
                        type="button"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                        onClick={() => handleDelete(id, fileLink)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
