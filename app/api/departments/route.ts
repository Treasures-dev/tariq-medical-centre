import Department from "@/lib/models/Departments";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
await import("@/lib/models/User");

export async function GET() {
  try {
    await connectDB();

    const departments = await Department.find()
      .populate("doctors", "name email avatar specialty")
      .lean();
    return NextResponse.json({ departments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
