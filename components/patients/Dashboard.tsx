"use client";

import AppointmentCard from "@/components/common/AppointmentCard";
import AppointmentModal from "@/components/patients/AppointmentModal";
import { Appointment } from "@/lib/types/types";
import { Calendar, Pill, Plus } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { authClient } from "@/lib/auth/authClient";

const THEME = "#0d3a66";

export default function PatientDashboardPage() {
  const { data: session } = authClient.useSession();
  const patientId = (session as any)?.user?.id;
  const user = (session as any)?.user;

  // hooks called unconditionally
  const [modalOpen, setModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/appointments?patientId=${patientId}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok) setAppointments(json.appointments || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [patientId]);

  const stats = useMemo(
    () => ({
      upcoming: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
    }),
    [appointments]
  );

  function truncate(s?: string, n = 80) {
    if (!s) return "";
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, rgba(13,58,102,0.04), rgba(255,255,255,0))` }}>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="relative mt-20 grid grid-cols-[320px_1fr] gap-8">

          {/* Left - Patient Sidebar (glass) */}
          <aside className="sticky top-20 rounded-2xl p-6 bg-white/60 backdrop-blur-md border border-white/40 shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user?.name || "Patient"} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">{user?.name}</div>
                )}
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full" style={{ background: THEME, boxShadow: `0 0 0 3px rgba(13,58,102,0.12)` }} />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-[#0d3a66]">{user?.name || "Patient"}</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/30 shadow-sm">
                <div className="text-xs text-gray-500">Upcoming</div>
                <div className="text-lg font-semibold text-gray-900">{stats.upcoming}</div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/30 shadow-sm">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-lg font-semibold text-gray-900">{stats.completed}</div>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 mt-6 py-2 rounded-md text-sm font-medium text-white shadow"
              style={{ background: THEME }}
            >
              <Plus className="w-4 h-4" />
              Book Appointment
            </button>

            <div className="mt-6 text-xs text-gray-500">
              <div className="mb-1">Tip</div>
              <div className="text-[13px]">Use this panel to quickly book appointments and view prescriptions.</div>
            </div>
          </aside>

          {/* Right - Main content */}
          <div className="space-y-6">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-semibold" style={{ color: THEME }}>Your Appointments</h2>
              </div>
              <span className="text-sm text-gray-600">{appointments.length} total</span>
            </div>

            <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-lg p-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : appointments.length === 0 ? (
                <p className="text-sm text-gray-500">No appointments</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="p-3 rounded-xl bg-white/80 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                      <AppointmentCard apt={apt} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescriptions card */}
            <div className="rounded-2xl bg-gradient-to-tr from-white/60 to-white/50 backdrop-blur-md border border-white/30 shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Pill className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold" style={{ color: THEME }}>Prescriptions</h3>
                </div>
                <span className="text-sm text-gray-600">{appointments.filter(a => !!a.prescription).length} total</span>
              </div>

              {appointments.filter(a => !!a.prescription).length === 0 ? (
                <p className="text-sm text-gray-500">No prescriptions yet</p>
              ) : (
                <div className="grid gap-3">
                  {appointments.filter(a => !!a.prescription).map((p) => (
                    <div key={p._id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/80 border border-white/30 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800">{p.doctorName}</h4>
                        <div className="text-sm text-gray-600 mt-1">{truncate((p.prescription as any)?.medications || "No medications recorded", 120)}</div>
                        <div className="mt-2 text-xs text-gray-500">{(p as any).updatedAt ? `Prescribed: ${new Date((p as any).updatedAt).toLocaleString()}` : null}</div>
                      </div>

               
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {modalOpen && (
        <AppointmentModal
          patientName={user?.name || "Patient"}
          defaultPhone=""
          defaultEmail=""
          onSuccess={(appt) => setAppointments((prev) => [appt, ...prev])}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
