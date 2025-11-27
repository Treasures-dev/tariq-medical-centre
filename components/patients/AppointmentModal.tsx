// components/AppointmentModal.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { X, User, Phone, Mail, CheckCircle, AlertCircle } from "lucide-react";
import DoctorList from "./DoctorList";
import DateSelector from "./Dateselector";
import UploadButton from "../Upload/UploadBtn";
import { Appointment, Doctor, FormValues } from "@/lib/types/types";
import { getSlotsForDoctorOnDate } from "@/lib/slots";
import { authClient } from "@/lib/auth/authClient";

type Props = {
  patientName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  onSuccess?: (appt: Appointment) => void;
  onClose?: () => void;
};

function normalizeDateIso(input?: string | null) {
  if (!input) return null;
  input = String(input).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

function parseTimeSlotTo24(slot?: string | null) {
  if (!slot) return slot;
  const m = String(slot)
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) {
    return String(slot).trim();
  }
  let hh = Number(m[1]);
  const mm = Number(m[2] ?? "0");
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && hh !== 12) hh += 12;
  if (ampm === "AM" && hh === 12) hh = 0;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function AppointmentModal({
  patientName = "",
  defaultPhone = "",
  defaultEmail = "",
  onSuccess,
  onClose,
}: Props) {
  const { register, handleSubmit, setValue, watch, reset, formState } =
    useForm<FormValues>({
      defaultValues: {
        patientName,
        phone: defaultPhone,
        email: defaultEmail,
        doctorId: "",
        type: "online",
        date: "",
        timeSlot: "",
        notes: "",
        photoUrl: "",
      },
    });

  const isSubmitting = formState.isSubmitting;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const watchedDoctorId = watch("doctorId");
  const watchedDateRaw = watch("date");
  const watchedTimeSlot = watch("timeSlot");
  const watchedType = watch("type", "online");
  const watchedPhoto = watch("photoUrl");

  const { data: session } = authClient.useSession();
  const patientId = session?.user?.id;

  // load doctors (simple)
  useEffect(() => {
    let mounted = true;
    setLoadingDoctors(true);
    (async () => {
      try {
        const res = await fetch("/api/admin/doctors");
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (res.ok && json.ok) setDoctors(json.doctors || []);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        if (mounted) setLoadingDoctors(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // fetch booked slots when doctor/date change
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingBooked, setLoadingBooked] = useState(false);

  useEffect(() => {
    let mounted = true;
    const docId = watchedDoctorId;
    const iso = normalizeDateIso(watchedDateRaw);
    if (!docId || !iso) {
      setBookedSlots([]);
      return;
    }
    setLoadingBooked(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/appointments/booked?doctorId=${encodeURIComponent(
            docId
          )}&date=${encodeURIComponent(iso)}`
        );
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (res.ok && json.ok && Array.isArray(json.booked)) {
          setBookedSlots(json.booked.map((s: string) => parseTimeSlotTo24(s)));
        } else {
          // fallback
          setBookedSlots(
            json.booked && Array.isArray(json.booked)
              ? json.booked.map((s: string) => parseTimeSlotTo24(s))
              : []
          );
        }
      } catch (err) {
        console.error("fetch booked slots failed", err);
        setBookedSlots([]);
      } finally {
        if (mounted) setLoadingBooked(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [watchedDoctorId, watchedDateRaw]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d._id === watchedDoctorId),
    [doctors, watchedDoctorId]
  );

  // compute allowed slots from doctor's availability
  const SLOT_INTERVAL = 45;
  const allowedTimeSlots = useMemo(() => {
    const iso = normalizeDateIso(watchedDateRaw);
    if (!selectedDoctor || !iso) return [];
    return getSlotsForDoctorOnDate(selectedDoctor.availability, iso);
  }, [selectedDoctor, watchedDateRaw, watchedType]);

  const createAppointment = async (payload: any) => {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json };
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    // simple client validation
    if (!data.patientName?.trim())
      return setServerError("Patient name required");
    if (!data.phone?.trim()) return setServerError("Phone required");
    if (!data.doctorId) return setServerError("Choose doctor");
    if (!data.date) return setServerError("Choose date");
    if (!data.timeSlot) return setServerError("Choose time");

    // ensure allowed slot
    if (!allowedTimeSlots.includes(data.timeSlot))
      return setServerError("Selected slot not allowed for this doctor/date");

    const payload = {
      doctorId: data.doctorId,
      date: data.date, // accepts YYYY-MM-DD or Date, API normalizes
      timeSlot: data.timeSlot, // "HH:mm" (or "9:00 AM" etc), API normalizes
      patientName: data.patientName,
      phone: data.phone,
      email: data.email,
      type: data.type,
      notes: data.notes,
      durationMinutes: 30,
      photoUrl: data.photoUrl,
    };


    try {
      const { ok, json } = await createAppointment(payload);
      if (!ok) {
        // 409 -> already booked: refresh booked slots
        if (
          json?.error &&
          (json?.error.toString().toLowerCase().includes("already booked") ||
            json?.status === 409)
        ) {
          const iso = normalizeDateIso(data.date);
          if (iso) {
            const r = await fetch(
              `/api/appointments/booked?doctorId=${encodeURIComponent(
                data.doctorId
              )}&date=${encodeURIComponent(iso)}`
            );
            const j = await r.json().catch(() => ({}));
            setBookedSlots(Array.isArray(j.booked) ? j.booked : []);
          }
        }
        setServerError(json?.error || "Failed to book");
        return;
      }
      setSuccessMsg("Appointment booked");
      onSuccess?.(json.appointment);
      reset();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose?.();
      }, 900);
    } catch (err: any) {
      console.error(err);
      setServerError(err?.message || "Network error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
    >
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => onClose?.()}
        />

        <div
          className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto"
          aria-live="polite"
        >
          <div className="sticky top-0 z-20 bg-white border-b p-4 flex items-center justify-between">
            <h3 id="appointment-modal-title" className="text-lg font-semibold">
              Book Appointment
            </h3>
            <button
              aria-label="Close"
              onClick={() => onClose?.()}
              className="p-2 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }}
            className="p-6 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Patient name</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    {...register("patientName")}
                    className="w-full pl-10 pr-3 py-2 border rounded"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    {...register("phone")}
                    className="w-full pl-10 pr-3 py-2 border rounded"
                    placeholder="+92 300 0000000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email (optional)</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border rounded"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Choose doctor</label>
              <div className="mt-2">
                <DoctorList
                  doctors={doctors}
                  loading={loadingDoctors}
                  searchTerm={""}
                  onSearchChange={() => {}}
                  selectedId={watch("doctorId")}
                  register={register}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Appointment type</label>
              <div className="mt-2 flex gap-3">
                <label
                  className={`p-2 border rounded cursor-pointer ${
                    watchedType === "online"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white"
                  }`}
                >
                  <input
                    {...register("type")}
                    type="radio"
                    value="online"
                    className="sr-only"
                  />
                  <div className="text-sm">Online</div>
                </label>
                <label
                  className={`p-2 border rounded cursor-pointer ${
                    watchedType === "walkin"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white"
                  }`}
                >
                  <input
                    {...register("type")}
                    type="radio"
                    value="walkin"
                    className="sr-only"
                  />
                  <div className="text-sm">Walk-in</div>
                </label>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                {!watch("doctorId") ? (
                  <div className="text-sm text-gray-500">
                    Choose a doctor to view available dates
                  </div>
                ) : (
                  <>
                    <DateSelector
                      availability={selectedDoctor?.availability}
                      daysAhead={30}
                      selectedIso={watch("date") || null}
                      onSelect={(iso: string) => {
                        setValue("date", iso);
                        setValue("timeSlot", "");
                      }}
                      className="mb-2"
                    />
                    <input
                      {...register("date")}
                      type="date"
                      value={watch("date") || ""}
                      onChange={(e) => {
                        const normalized =
                          normalizeDateIso(e.target.value) || e.target.value;
                        setValue("date", normalized);
                        setValue("timeSlot", "");
                      }}
                      className="w-full px-3 py-2 border rounded"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time slot <span className="text-red-500">*</span>
                </label>

                {/* legend */}
                <div className="flex items-center gap-3 text-sm mb-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">Available</span>
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-3" />
                  <span className="text-gray-600">Booked</span>
                </div>

                {!watch("doctorId") || !watch("date") ? (
                  <div className="text-sm text-gray-500">
                    Select a doctor and date to see available times.
                  </div>
                ) : selectedDoctor &&
                  (!selectedDoctor.availability ||
                    selectedDoctor.availability.length === 0) ? (
                  <div className="text-sm text-red-600">
                    This doctor has no availability information.
                  </div>
                ) : allowedTimeSlots.length === 0 ? (
                  <div className="text-sm text-red-600">
                    No slots match doctor's availability for this date/type.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {allowedTimeSlots.map((slot) => {
                      const normalized = parseTimeSlotTo24(slot) as string;
                      const isBooked = bookedSlots.includes(normalized);
                      const isSelected = watchedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => {
                            if (!isBooked)
                              setValue("timeSlot", slot, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                          }}
                          className={`px-2 py-2 rounded-md text-sm text-center transition 
         ${
           isBooked
             ? "bg-red-50 text-red-700 border border-red-200 cursor-not-allowed"
             : isSelected
             ? "bg-[#0d3a66] text-white shadow"
             : "bg-white text-gray-700 border border-gray-200 hover:shadow-sm"
         }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
                {loadingBooked && (
                  <div className="text-sm text-gray-500 mt-2">
                    Loading booked slots...
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                {...register("notes")}
                rows={3}
                className="mt-1 w-full px-3 py-2 border rounded"
                placeholder="Describe your issue..."
              />
            </div>

            {watchedType === "online" && (
              <div>
                <label className="text-sm font-medium">
                  Attach photo (optional)
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <UploadButton
                    onStart={() => {}}
                    onSuccess={(url) =>
                      setValue("photoUrl", url, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onError={(e) => {e.error}}
                  />
                  <input type="hidden" {...register("photoUrl")} />
                  {watchedPhoto ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={watchedPhoto}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => setValue("photoUrl", "")}
                        className="text-sm text-red-600 underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Optional — helpful for telehealth.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              {serverError && (
                <div className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> <span>{serverError}</span>
                </div>
              )}
              {successMsg && (
                <div className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> <span>{successMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose?.();
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0d3a66] text-white rounded"
              >
                {isSubmitting ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
