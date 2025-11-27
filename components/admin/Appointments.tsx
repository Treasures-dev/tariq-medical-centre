"use client";

import useSWR from "swr";
import React from "react";

type RawId = { $oid?: string } | string;
type AppointmentServerShape = {
  _id: RawId;
  patientId?: RawId | { _id: RawId; name?: string };
  patientName?: string;
  phone?: string;
  email?: string;
  doctorId?: RawId | { _id: RawId; name?: string };
  doctorName?: string;
  doctorSpecialty?: string;
  type?: string;
  date?: string | { $date?: string } | null;
  timeSlot?: string;
  notes?: string;
  photoUrl?: string;
  status?: string;
  prescription?: any;
  createdAt?: string | { $date?: string };
  updatedAt?: string | { $date?: string };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function extractId(raw: RawId | undefined): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  return raw.$oid;
}

function parseDateField(d: AppointmentServerShape["date"]): Date | null {
  if (!d) return null;
  if (typeof d === "string") return new Date(d);
  if (typeof d === "object" && (d as any).$date) return new Date((d as any).$date);
  return null;
}

export default function AppointmentsView() {
  const { data, error, isLoading } = useSWR<{ appointments: AppointmentServerShape[] }>("/api/admin/appointments", fetcher);

  if (isLoading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-600">Failed to load appointments</p>;

  const appointments = data?.appointments ?? [];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-[#0d3a66] mb-4">Appointments</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 pr-4 font-semibold text-gray-700">Patient</th>
              <th className="pb-3 pr-4 font-semibold text-gray-700">Doctor</th>
              <th className="pb-3 pr-4 font-semibold text-gray-700">Date & Time</th>
              <th className="pb-3 pr-4 font-semibold text-gray-700">Status</th>
              <th className="pb-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}

            {appointments.map((aptRaw) => {
              const id = extractId(aptRaw._id) ?? Math.random().toString(36).slice(2);
              const patientName = aptRaw.patientName ?? (aptRaw.patientId && typeof aptRaw.patientId !== "string" ? (aptRaw.patientId as any).name : undefined) ?? "—";
              const doctorName = aptRaw.doctorName ?? (aptRaw.doctorId && typeof aptRaw.doctorId !== "string" ? (aptRaw.doctorId as any).name : undefined) ?? "—";
              const dateObj = parseDateField(aptRaw.date);
              const timeSlot = aptRaw.timeSlot;
              const statusRaw = (aptRaw.status || "unknown").toString().toLowerCase();
              const statusLabel = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);

              // Display either "Dec 1, 2025 · 9:30 AM" (if date + timeSlot) or fallback to date/time string
              const dateDisplay = dateObj
                ? timeSlot
                  ? `${dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · ${timeSlot}`
                  : dateObj.toLocaleString()
                : timeSlot ?? "—";

              // badge classes
              const badge =
                statusRaw === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : statusRaw === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : statusRaw === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : statusRaw === "cancelled"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-gray-100 text-gray-700";

              return (
                <tr key={id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-900 font-medium">{patientName}</td>
                  <td className="py-3 pr-4 text-gray-700">{doctorName}</td>
                  <td className="py-3 pr-4 text-gray-700">{dateDisplay}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${badge}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#0d3a66] text-white hover:bg-[#0a2d4d] transition-colors"
                        // TODO: replace with real open handler
                 
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                   
                      >
                        Cancel
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
