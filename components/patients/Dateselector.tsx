// components/DateSelector.tsx
"use client";
import React, { useMemo } from "react";

type AvailabilityWindow = {
  day: string; // "monday"
  from: string; // "09:00"
  to: string;   // "17:00"
  telehealth?: boolean;
};

type DateItem = {
  date: Date;
  iso: string; // yyyy-mm-dd
};

type Props = {
  availability?: AvailabilityWindow[] | null;
  daysAhead?: number; // how many days to show (default 30)
  selectedIso?: string | null;
  onSelect: (isoDate: string) => void;
  className?: string;
};

const getDayName = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

function toISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Return list of upcoming dates (next N) that match at least one availability day */
export default function DateSelector({
  availability,
  daysAhead = 30,
  selectedIso,
  onSelect,
  className = "",
}: Props) {
  const availableDates = useMemo(() => {
    const result: DateItem[] = [];
    if (!availability || availability.length === 0) return result;

    const availabilityDays = new Set(
      availability.map((a) => (a.day || "").toLowerCase())
    );

    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = getDayName(d);
      if (availabilityDays.has(dayName)) {
        result.push({ date: d, iso: toISO(d) });
      }
    }
    return result;
  }, [availability, daysAhead]);

  if (availableDates.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No available dates found for this doctor.
      </div>
    );
  }

  return (
    <div className={`flex gap-2 overflow-x-auto py-2 ${className}`}>
      {availableDates.map(({ date, iso }) => {
        const isSelected = iso === selectedIso;
        const label = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition
              ${isSelected ? "bg-[#0d3a66] text-white shadow" : "bg-white text-gray-700 border-gray-200 hover:shadow-sm"}`}
            aria-pressed={isSelected}
          >
            <div className="whitespace-nowrap">{label}</div>
          </button>
        );
      })}
    </div>
  );
}
