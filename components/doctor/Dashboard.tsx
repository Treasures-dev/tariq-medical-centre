"use client";

import React, { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth/authClient";
import AppointmentCard from "@/components/common/AppointmentCard";
import PrescriptionModal from "@/components/common/PrescriptionModal";
import type { Appointment } from "@/lib/types/types";
import { Calendar, CheckCircle, Clock } from "lucide-react";

// Theme color used across the component
const THEME = "#0d3a66";

export default function DoctorDashboardPage() {
  const { data: session } = authClient.useSession();
  const user = (session as any)?.user;
  const doctorId = user?.id;

  // --- hooks (always called unconditionally) ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!doctorId) return;
    fetchAppointments();
  }, [doctorId]);

  async function fetchAppointments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to fetch");
      setAppointments(json.appointments || []);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const updateLocal = (id: string, patch: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, ...patch } : a)));
  };

  const handleAction = async (id: string, action: "confirm" | "complete" | "delete") => {
    setActionLoadingId(id);
    try {
      if (action === "delete") {
        const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        return;
      }
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update");
      updateLocal(id, { status: action === "confirm" ? "confirmed" : "completed" });
    } catch (err: any) {
      setError(err?.message);
      await fetchAppointments();
    } finally {
      setActionLoadingId(null);
    }
  };

  const openPrescription = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowPrescriptionModal(true);
  };

  const submitPrescription = async (data: { medications: string; notes?: string }) => {
    if (!selectedAppointment) return;
    setActionLoadingId(selectedAppointment._id ?? selectedAppointment._id);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescription: data }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      updateLocal(selectedAppointment._id, { prescription: json.appointment?.prescription || data });
      setShowPrescriptionModal(false);
      setSelectedAppointment(null);
    } catch (err: any) {
      setError(err?.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
    }),
    [appointments]
  );

  // New: prescriptions derived from appointments that have a prescription object
  const prescriptions = useMemo(() => {
    return appointments
      .filter((a) => !!(a.prescription && ((a.prescription as any).medications || (a.prescription as any).notes)))
      .sort((a, b) => {
        const aDate = (a as any).updatedAt ? new Date((a as any).updatedAt) : new Date(0);
        const bDate = (b as any).updatedAt ? new Date((b as any).updatedAt) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
  }, [appointments]);

  function truncate(s?: string, n = 80) {
    if (!s) return "";
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  return (
    // page gradient + soft background
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, rgba(13,58,102,0.06), rgba(255,255,255,0))` }}>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="relative grid mt-20 grid-cols-[320px_1fr] gap-8">

          {/* Left - themed sidebar (glass) */}
          <aside className="sticky top-20 rounded-2xl p-6 bg-white/60 backdrop-blur-md border border-white/40 shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user?.name || "Doctor"} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">{user?.name}</div>
                )}
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full" style={{ background: THEME, boxShadow: `0 0 0 3px rgba(13,58,102,0.12)` }} />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-[#0d3a66]">{user?.name || "Doctor"}</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/30 shadow-sm">
                <div className="text-xs text-gray-500">Pending</div>
                <div className="text-lg font-semibold text-gray-900">{stats.pending}</div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/30 shadow-sm">
                <div className="text-xs text-gray-500">Confirmed</div>
                <div className="text-lg font-semibold text-gray-900">{stats.confirmed}</div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/30 shadow-sm">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-lg font-semibold text-gray-900">{stats.completed}</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <div className="mb-1">Tip</div>
              <div className="text-[13px]">Use the prescriptions panel to quickly review recent scripts and print them for patients.</div>
            </div>
          </aside>

          {/* Right - Main content container (floating cards) */}
          <div className="space-y-6">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: THEME }}>Appointments</h2>
              <span className="text-sm text-gray-600">{appointments.length} total</span>
            </div>

            <div className="space-y-4">
              {/* Appointments card */}
              <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-lg p-4">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : appointments.length === 0 ? (
                  <p className="text-sm text-gray-500">No appointments</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((a) => (
                      <AppointmentCard
                        key={a._id}
                        apt={a}
                        onConfirm={() => handleAction(a._id, "confirm")}
                        onComplete={() => handleAction(a._id ?? a._id, "complete")}
                        onDelete={() => handleAction(a._id, "delete")}
                        onPrescribe={() => openPrescription(a)}
                        loading={actionLoadingId === a._id}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Prescriptions card */}
              <div className="rounded-2xl bg-gradient-to-tr from-white/60 to-white/50 backdrop-blur-md border border-white/30 shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold" style={{ color: THEME }}>Recent Prescriptions</h3>
                  <span className="text-sm text-gray-600">{prescriptions.length} total</span>
                </div>

                {prescriptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No prescriptions yet</p>
                ) : (
                  <div className="grid gap-3">
                    {prescriptions.map((p) => (
                      <div key={p._id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/80 border border-white/30 shadow-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <h4 className="font-semibold text-gray-800">{p.patientName}</h4>
                              <div className="text-sm text-gray-600 mt-1">{truncate((p.prescription as any)?.medications || "No medications recorded", 120)}</div>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            {(p as any).updatedAt ? (
                              <span>Prescribed: {new Date((p as any).updatedAt).toLocaleString()}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => openPrescription(p)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-md text-white"
                            style={{ background: THEME }}
                          >
                            View
                          </button>

                          <a
                            href={`/api/appointments/${p._id}/prescription/print`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-xs font-semibold rounded-md border"
                            style={{ borderColor: THEME, color: THEME }}
                          >
                            Print
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>

      {showPrescriptionModal && selectedAppointment && (
        <PrescriptionModal
          patientName={selectedAppointment.patientName}
          initialMedications={(selectedAppointment.prescription as any)?.medications || ""}
          initialNotes={(selectedAppointment.prescription as any)?.notes || ""}
          onClose={() => {
            setShowPrescriptionModal(false);
            setSelectedAppointment(null);
          }}
          onSubmit={submitPrescription}
          loading={actionLoadingId === selectedAppointment._id}
        />
      )}
    </div>
  );
}
