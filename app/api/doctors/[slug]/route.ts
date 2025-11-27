import User from "@/lib/models/User";
import connectDB from "@/lib/mongoose";
import { RouteParams } from "@/lib/types/types";
import { makeDoctorFilter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Missing slug" },
        { status: 400 }
      );
    }

    const filter = makeDoctorFilter(slug);
    const doctor = await User.findOne(filter).populate("dept").lean();

    if (!doctor) {
      return NextResponse.json(
        { ok: false, error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, doctor });
  } catch (err: any) {
    console.error("GET /api/admin/doctors/[slug] error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
