import Department from "@/lib/models/Departments";
import connectDB from "@/lib/mongoose";
import { RouteParams } from "@/lib/types/types";
import { makeDepartmentFilter } from "@/lib/utils";
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

    const department = await Department.findOne(makeDepartmentFilter(slug))
      .populate("doctors")
      .lean();

    if (!department) {
      return NextResponse.json(
        { ok: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, department });
  } catch (err: any) {
    console.error("GET /api/admin/departments/[slug] error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
