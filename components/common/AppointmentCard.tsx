// components/common/AppointmentCard.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  Pill,
  User,
  Tag,
  Check,
  X,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { authClient } from "@/lib/auth/authClient";
import type { Appointment } from "@/lib/types/types";

const statusStyles: Record<string, { dot: string; text: string; bg: string; label?: string }> = {
  confirmed: { dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50", label: "Confirmed" },
  confirm: { dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50", label: "Confirmed" },
  completed: { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-50", label: "Completed" },
  pending: { dot: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
  cancelled: { dot: "bg-red-400", text: "text-red-500", bg: "bg-red-50", label: "Cancelled" },
  cancelled_by_user: { dot: "bg-red-400", text: "text-red-500", bg: "bg-red-50", label: "Cancelled" },
};

function parseDateField(d: any): Date | null {
  if (!d) return null;
  if (typeof d === "object") {
    if (d.$date) return new Date(d.$date);
    if (d.$numberLong) return new Date(Number(d.$numberLong));
    if (d instanceof Date) return d;
  }
  if (typeof d === "string" || typeof d === "number") return new Date(d);
  return null;
}

export const AppointmentCard: React.FC<{
  apt: Appointment;
  onConfirm?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  onPrescribe?: () => void;
  onCancelRequest?: () => void;
  loading?: boolean;
}> = ({ apt, onConfirm, onComplete, onPrescribe, onCancelRequest, onDelete, loading = false }) => {
  const { data: session } = authClient.useSession();
  const role = (session as any)?.user?.role ?? "";
  const isDoctor = role === "doctor";
  const isPatient = role === "patient";

  const userToShow = isDoctor ? (apt.patientId as any) : (apt.doctorId as any);
  const name = isDoctor ? apt.patientName ?? userToShow?.name ?? "Patient" : apt.doctorName ?? userToShow?.name ?? "Doctor";
  const avatarUrl = userToShow?.avatar ?? userToShow?.image ?? null;
  // This is the disease/photo to show in the zoom modal (not the avatar)
  const photoUrl = (apt as any).photoUrl ?? null;

  const phone = (apt as any).phone ?? (apt.doctorId as any)?.phone ?? (apt.patientId as any)?.phone ?? "";
  const email = (apt as any).email ?? (apt.doctorId as any)?.email ?? (apt.patientId as any)?.email ?? "";

  const start = parseDateField((apt as any).startTime) ?? parseDateField(apt.dateISO);
  const end = parseDateField((apt as any).endTime);
  const dateStr = start
    ? start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: undefined })
    : apt.dateISO || "—";

  const timeRange =
    start && end
      ? `${start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} — ${end.toLocaleTimeString(
          undefined,
          { hour: "2-digit", minute: "2-digit" }
        )}`
      : apt.slot
      ? apt.slot
      : "—";

  const duration = apt.durationMinutes ? `${apt.durationMinutes}m` : "";
  const specialty = apt.doctorSpecialty ?? (apt as any).specialty ?? "";
  const apptType = apt.type ?? "in-person";
  const statusKey = (apt.status || "").toString().toLowerCase();
  const s = statusStyles[statusKey] || { dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-50", label: apt.status ?? "Unknown" };

  const [imgError, setImgError] = useState(false);

  // Modal & zoom state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTranslateRef = useRef({ x: 0, y: 0 });
  const imgContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
      if (isModalOpen) {
        if (e.key === "+" || e.key === "=") zoomIn();
        if (e.key === "-" || e.key === "_") zoomOut();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, scale]);

  function openModal() {
    setIsModalOpen(true);
    // reset transform when opening
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    lastTranslateRef.current = { x: 0, y: 0 };
  }

  function closeModal() {
    setIsModalOpen(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    lastTranslateRef.current = { x: 0, y: 0 };
  }

  function zoomIn() {
    setScale((s) => Math.min(s + 0.25, 4));
  }
  function zoomOut() {
    setScale((s) => Math.max(s - 0.25, 0.5));
  }
  function resetZoom() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    lastTranslateRef.current = { x: 0, y: 0 };
  }

  // Drag handlers (mouse)
  function handleMouseDown(e: React.MouseEvent) {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nx = lastTranslateRef.current.x + dx;
    const ny = lastTranslateRef.current.y + dy;
    setTranslate({ x: nx, y: ny });
  }
  function handleMouseUp() {
    if (!isDragging) return;
    setIsDragging(false);
    lastTranslateRef.current = { ...translate };
    dragStartRef.current = null;
  }

  // Touch handlers
  function handleTouchStart(e: React.TouchEvent) {
    if (scale <= 1) return;
    const t = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { x: t.clientX, y: t.clientY };
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging || !dragStartRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStartRef.current.x;
    const dy = t.clientY - dragStartRef.current.y;
    const nx = lastTranslateRef.current.x + dx;
    const ny = lastTranslateRef.current.y + dy;
    setTranslate({ x: nx, y: ny });
  }
  function handleTouchEnd() {
    setIsDragging(false);
    lastTranslateRef.current = { ...translate };
    dragStartRef.current = null;
  }

  return (
    <>
      <article className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        {/* Left - avatar */}
        <div className="shrink-0">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {avatarUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-sm text-gray-700 font-medium">
                <User className="w-6 h-6" />
                <span className="mt-1 text-xs">{(name || "—").split(" ").map((s:any) => s[0]).slice(0, 2).join("")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle - details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
                {specialty && <span className="text-xs text-gray-500">• {specialty}</span>}
                {duration && <span className="ml-2 text-xs text-gray-400">({duration})</span>}
              </div>

              <p className="mt-1 text-xs text-gray-500 truncate">
                <span className="inline-flex items-center gap-1 mr-3">
                  <Calendar className="w-3 h-3" /> {dateStr}
                </span>
                <span className="inline-flex items-center gap-1 mr-3">
                  <Clock className="w-3 h-3" /> {timeRange}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {apptType}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${s.bg}`}>
                <span className={`w-2 h-2 rounded-full ${s.dot} inline-block`} />
                <span className={`capitalize ${s.text}`}>{s.label ?? apt.status}</span>
              </div>

              <div className="text-right text-xs text-gray-400">
                <div>{new Date(apt.createdAt ? (apt.createdAt as any).$date ?? apt.createdAt : Date.now()).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {apt.notes && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{apt.notes}</p>}

          {/* Prescription */}
          {apt.prescription && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-md">
              <Pill className="w-4 h-4" />
              <span className="text-sm">{(apt.prescription as any).medications ?? "Prescription available"}</span>
            </div>
          )}

          {/* bottom actions */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {/* Image zoom button (common for both roles if photo exists) */}
            {photoUrl && (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition"
                title="Open image"
              >
                <Maximize2 className="w-4 h-4" /> View Image
              </button>
            )}

            {/* Doctor actions */}
            {isDoctor && (
              <>
                {onConfirm && statusKey !== "confirmed" && statusKey !== "completed" && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Confirm
                  </button>
                )}

                {onComplete && statusKey !== "completed" && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
                    onClick={onComplete}
                    disabled={loading}
                  >
                    <Check className="w-4 h-4" /> Complete
                  </button>
                )}

                {onPrescribe && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 text-xs font-medium hover:bg-gray-200 transition"
                    onClick={onPrescribe}
                  >
                    <Pill className="w-4 h-4" /> Prescribe
                  </button>
                )}
              </>
            )}

            {/* Patient actions */}
            {isPatient && (
              <>
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 text-xs font-medium hover:bg-gray-200 transition"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 text-xs font-medium hover:bg-gray-200 transition"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                )}
                {onCancelRequest && statusKey !== "completed" && statusKey !== "cancelled" && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    onClick={onCancelRequest}
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
              </>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs text-gray-500 hover:bg-gray-50 transition ml-auto"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          onMouseUp={handleMouseUp}
          onTouchEnd={handleTouchEnd}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative z-60 max-w-5xl w-full max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 p-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {avatarUrl && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center text-gray-600">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500">{specialty} • {dateStr} {timeRange}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-xs"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={resetZoom}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-xs"
                  title="Reset"
                >
                  <ZoomIn className="w-4 h-4" /> Reset
                </button>
                <button
                  onClick={zoomIn}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-xs"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 hover:bg-red-100 text-xs text-red-600 ml-2"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image area */}
            <div
              ref={imgContainerRef}
              className="relative bg-black/5 w-full h-[72vh] flex items-center justify-center overflow-hidden touch-pan-y"
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              {/* image element */}
              <div
                className="transform-gpu"
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 120ms ease-out",
                  cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "auto",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Picture"
                  className="max-w-none max-h-[78vh] select-none pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* small hint */}
              <div className="absolute bottom-3 left-3 text-xs text-white/90 bg-black/30 px-2 py-1 rounded-md">
                {scale > 1 ? `Zoom ${Math.round(scale * 100)}% • Drag to pan` : "Zoom to explore"}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
