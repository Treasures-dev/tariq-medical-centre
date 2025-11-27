// app/api/appointments/route.ts
import { NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import User from "@/lib/models/User";
import connectDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { appointmentSchema } from "@/lib/validators/appointment"; // keep using your zod validator
import mongoose from "mongoose"; // DON'T import { Date } from mongoose (it shadows global Date)

await import("@/lib/models/User");
await import("@/lib/models/Appointment");

function normalizeSlot(slot?: string | null): string | null {
  if (!slot) return null;
  const m = String(slot).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) {
    return String(slot).trim(); // assume already "HH:mm"
  }
  let hh = Number(m[1]);
  const mm = Number(m[2] ?? "0");
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && hh !== 12) hh += 12;
  if (ampm === "AM" && hh === 12) hh = 0;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Convert a Date or string parseable by `new Date()` to YYYY-MM-DD (UTC).
 *  Throws on invalid date.
 */
function toISO(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date for toISO(): " + input);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Backwards-compatible name used in this file (you had toDateISO calls). */
function toDateISO(dateLike: string): string {
  // Accept YYYY-MM-DD or any parseable string — prefer to return YYYY-MM-DD
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateLike)) return dateLike;
  return toISO(dateLike);
}


export async function GET(req: Request) {
  await connectDB();

  // auth
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const doctorIdParam = url.searchParams.get("doctorId");
    const dateParam = url.searchParams.get("date"); // expect YYYY-MM-DD


    if (doctorIdParam && dateParam) {
      // validate/normalize doctorId
      const doctorOid = mongoose.Types.ObjectId.isValid(doctorIdParam)
        ? new mongoose.Types.ObjectId(doctorIdParam)
        : doctorIdParam;

      const dateISO = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateParam)
        ? dateParam
        : toDateISO(dateParam);

      // Query by exact fields (fast if indexed)
      const docs = await Appointment.find({ doctorId: doctorOid, dateISO })
        .select("slot -_id")
        .lean();

      const booked = docs.map((d: any) => d.slot);
      return NextResponse.json({ ok: true, booked }, { status: 200 });
    }

    // ---------- Mode B: full appointments (dashboard / list) ----------
    const role = session.user.role;
    const userId = session.user.id;

    let query: any = {};

    if (role === "doctor") {
      query.doctorId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    } else if (role === "patient") {
      query.patientId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    } else {
      if (doctorIdParam) {
        query.doctorId = mongoose.Types.ObjectId.isValid(doctorIdParam) ? new mongoose.Types.ObjectId(doctorIdParam) : doctorIdParam;
      }
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1, startTime: -1 })
      .populate(role === "doctor" ? "patientId" : "doctorId", "name email phone avatar specialty role")
      .lean();

    return NextResponse.json({ ok: true, appointments }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/appointments/booked error:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  if (session.user.role !== "patient")
    return NextResponse.json(
      { ok: false, error: "Only patients can book" },
      { status: 403 }
    );

  await connectDB();

  try {
    const body = await req.json();
    const payload = { ...body, patientId: String(session.user.id) };

    // validate
    const parsed = appointmentSchema.safeParse(payload);
    if (!parsed.success) {
      const msgs = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ ok: false, error: msgs }, { status: 400 });
    }
    const valid = parsed.data; // typed now according to appointmentSchema

    // normalize date -> vardateISO (string "YYYY-MM-DD")
    const vardateISO = /^\d{4}-\d{2}-\d{2}$/.test(String(valid.date))
      ? String(valid.date)
      : toISO(valid.date as any);

    // normalize slot and ensure it exists
    const slot = normalizeSlot(valid.timeSlot as any);
    if (!slot) {
      return NextResponse.json(
        { ok: false, error: "Invalid or missing timeSlot" },
        { status: 400 }
      );
    }

    // convert doctorId to ObjectId if valid
    const doctorId = mongoose.Types.ObjectId.isValid(valid.doctorId)
      ? new mongoose.Types.ObjectId(valid.doctorId)
      : valid.doctorId;

    // check conflict quickly (optional; DB unique index will also prevent race)
    const existing = await Appointment.findOne({
      doctorId,
      dateISO: vardateISO,
      slot,
    }).lean();
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Time slot already booked" },
        { status: 409 }
      );
    }

    // parse slot into start time safely
    // TypeScript sometimes won't narrow slot even after guard; cast to string to be explicit
    const [hh, mm] = (slot as string).split(":").map(Number);
    const [y, mo, d] = vardateISO.split("-").map(Number);
    const startTime = new Date(Date.UTC(y, mo - 1, d, hh, mm, 0)); // store as UTC (recommended)

    // safe access for duration: prefer to add durationMinutes to your zod schema;
    // until then, use optional access and fallback.
    const duration = (valid as any).durationMinutes ?? 30;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // fetch doctor and patient minimal fields in parallel
    const [doc, pat] = await Promise.all([
      User.findById(valid.doctorId).select("name specialty").lean(),
      User.findById(payload.patientId)
        .select("name email")
        .lean()
        .catch(() => null),
    ]);

    const apptDoc = {
      patientId: payload.patientId,
      patientName: (valid as any).patientName ?? pat?.name ?? "",
      phone: (valid as any).phone,
      email: (valid as any).email ?? pat?.email ?? "",
      doctorId: valid.doctorId,
      doctorName: doc?.name,
      doctorSpecialty: doc?.specialty,
      type: (valid as any).type,
      dateISO: vardateISO,
      slot,
      photoUrl:payload.photoUrl,
      startTime,
      endTime,
      durationMinutes: duration,
      notes: (valid as any).notes ?? "",
      status: "pending",
    } as any;

    // create (DB unique index will protect from race; handle 11000)
    const appt = await Appointment.create(apptDoc);
    const populated = await Appointment.findById(appt._id).lean();

    return NextResponse.json(
      { ok: true, appointment: populated },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/appointments error:", err);
    if (err?.code === 11000) {
      return NextResponse.json(
        { ok: false, error: "Time slot already booked" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
