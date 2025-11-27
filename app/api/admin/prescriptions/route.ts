import { auth } from "@/auth";
import Appointment from "@/lib/models/Appointment";
import connectDB from "@/lib/mongoose";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const prescriptions = await Appointment.aggregate([
      { $project: { _id: 1, prescription: 1, patientName: 1, doctorName: 1 } },
    ]);
    return NextResponse.json({ ok: true, data: prescriptions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
