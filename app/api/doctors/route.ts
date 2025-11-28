import User from "@/lib/models/User";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
await import("@/lib/models/Departments");

export async function GET() {
  await connectDB();

  const doctors = await User.find({ role: "doctor" })
    .populate("dept")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, doctors });
}
