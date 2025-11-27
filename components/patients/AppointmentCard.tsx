// components/AppointmentCard.tsx
"use client";
import React from "react";
import { Calendar, Clock, Check, X } from "lucide-react";
import type { Appointment } from "@/lib/types/types";

const statusStyles: Record<string, string> = {
  confirm: "text-blue-600",
  completed: "text-green-600",
  pending: "text-amber-600",
  cancelled: "text-red-400",
};

export const AppointmentCard: React.FC<{ apt: Appointment }> = ({ apt }) => {
  const isCompleted = apt.status === "completed";
  const isCancelled = apt.status === "cancelled";

  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex gap-3">
        <div className={`mt-0.5 ${statusStyles[apt.status] || "text-gray-400"}`}>
          {isCompleted ? <Check className="w-4 h-4" /> : isCancelled ? <X className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current mt-1" />}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">{apt.doctorName || "Doctor"}</p>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {apt.timeSlot}
            </span>
            <span className={apt.type === "online" ? "text-purple-600" : "text-gray-500"}>
              {apt.type === "online" ? "Online" : "In-person"}
            </span>
          </div>

          {apt.notes && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{apt.notes}</p>
          )}

          {apt.prescription && (
            <p className="text-xs text-green-600 mt-1">Prescription available</p>
          )}
        </div>
      </div>

      <span className={`text-xs capitalize ${statusStyles[apt.status] || "text-gray-400"}`}>
        {apt.status}
      </span>
    </div>
  );
};

export default AppointmentCard;