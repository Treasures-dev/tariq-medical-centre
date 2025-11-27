// app/api/appointments/booked/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Appointment from "@/lib/models/Appointment";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const doctorId = url.searchParams.get("doctorId");
  const date = url.searchParams.get("date"); // expect YYYY-MM-DD

  if (!doctorId || !date) {
    return NextResponse.json({ ok: false, error: "doctorId and date required" }, { status: 400 });
  }

  const doctorOid = mongoose.Types.ObjectId.isValid(doctorId) ? new mongoose.Types.ObjectId(doctorId) : doctorId;
  const dateISO = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date(date).toISOString().split("T")[0];

  const docs = await Appointment.find({ doctorId: doctorOid, dateISO }).select("slot -_id").lean();
  const booked = docs.map(d => d.slot);
  return NextResponse.json({ ok: true, booked }, { status: 200 });
}
