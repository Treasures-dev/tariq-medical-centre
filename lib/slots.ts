export type AvWindow = {
  day: string;
  from: string;
  to: string;
  telehealth?: boolean;
};

// parse "HH:mm" -> minutes since midnight (0..1439)
export function hhmmToMinutes(hhmm: string): number | null {
  if (!hhmm) return null;
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(mm)) return null;
  return h * 60 + mm;
}

export function minutestoHHMM(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// minutes -> "9:00 AM" friendly
export function minutesTo12h(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hh12 = ((h + 11) % 12) + 1; // convert 0->12
  return `${hh12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// generate slots from fromHHMM -> toHHMM inclusive-start exclusive-end with interval minutes
export function generateSlots(
  fromHHMM: string,
  toHHMM: string,
  interval = 30
): string[] {
  const from = hhmmToMinutes(fromHHMM);
  const to = hhmmToMinutes(toHHMM);
  if (from === null || to === null) return [];
  if (to <= from) return [];
  const slots: string[] = [];
  for (let t = from; t + interval <= to; t += interval) {
    slots.push(minutesTo12h(t));
  }
  return slots;
}

// given a doctor's availability array, dateIso (yyyy-mm-dd) and appointment type,
// produce deduped, sorted slots (in "9:00 AM" labels). interval in minutes (15,30 etc)
export function getSlotsForDoctorOnDate(
  availability: AvWindow[] | undefined | null,
  dateIso: string | null | undefined,
  interval = 30
): string[] {
  if (!availability || !dateIso) return [];
  // compute weekday e.g. "monday"
  const d = new Date(dateIso + "T00:00:00");
  if (isNaN(d.getTime())) return [];
  const weekday = d
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  // collect all windows that match weekday (and telehealth if online)
  const windows = (availability || []).filter((w) => {
    const wday = String(w.day ?? "").toLowerCase();
    if (wday !== weekday) return false;

    return true;
  });

  if (!windows.length) return [];

  // generate slots for each window, dedupe using a Set of minutes value to ensure correct sort
  const slotMinutesSet = new Set<number>();
  for (const win of windows) {
    const from = hhmmToMinutes(win.from);
    const to = hhmmToMinutes(win.to);
    if (from === null || to === null) continue;
    if (to <= from) continue;
    for (let t = from; t + interval <= to; t += interval) {
      slotMinutesSet.add(t);
    }
  }

  // convert set to sorted array of minutes
  const mins = Array.from(slotMinutesSet).sort((a, b) => a - b);
  // convert to friendly labels
  return mins.map(minutesTo12h);
}
