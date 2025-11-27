// app/api/admin/doctors/[slug]/route.ts
import { NextResponse } from "next/server";
import { doctorSchema } from "@/lib/validators/doctors";
import User from "@/lib/models/User";
import connectDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { headers } from "next/headers";
import mongoose from "mongoose";
import Department from "@/lib/models/Departments";
import { RouteParams } from "@/lib/types/types";
import { makeDoctorFilter } from "@/lib/utils";



export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    const filter = makeDoctorFilter(slug);
    const doctor = await User.findOne(filter).lean();

    if (!doctor) {
      return NextResponse.json({ ok: false, error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, doctor });
  } catch (err: any) {
    console.error("GET /api/admin/doctors/[slug] error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = doctorSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
    }

    const updateData = parsed.data;

    // Find the doctor first (so we know previous dept)
    const doctor = await User.findOne(makeDoctorFilter(slug));
    if (!doctor) {
      return NextResponse.json({ ok: false, error: "Doctor not found" }, { status: 404 });
    }

    const prevDeptId = doctor.dept ? String(doctor.dept) : null;
    const newDeptId = updateData.dept ? String(updateData.dept) : null;


    const updatedDoctor = await User.findOneAndUpdate(
      makeDoctorFilter(slug),
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // --- Sync Department relation ---
    if (newDeptId && newDeptId !== prevDeptId) {
      // Remove from old dept
      if (prevDeptId) {
        await Department.updateOne(
          { _id: prevDeptId },
          { $pull: { doctors: updatedDoctor?._id } }
        );
      }

      // Add to new dept (no duplicates because of $addtoset)
      await Department.updateOne(
        { _id: newDeptId },
        { $addToSet: { doctors: updatedDoctor?._id } }
      );
    }

    // If dept removed (set null)
    if (!newDeptId && prevDeptId) {
      await Department.updateOne(
        { _id: prevDeptId },
        { $pull: { doctors: updatedDoctor?._id } }
      );
    }

    // Return updated doctor with dept populated
    const result = await User.findById(updatedDoctor?._id)
      .populate("dept", "name slug")
      .lean();

    return NextResponse.json({ ok: true, doctor: result });
  } catch (err: any) {
    console.error("PATCH /api/admin/doctors/[slug] error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    await connectDB();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    const filter = makeDoctorFilter(slug);
    const doctor = await User.findOneAndDelete(filter);

    if (!doctor) {
      return NextResponse.json({ ok: false, error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Doctor deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/admin/doctors/[slug] error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
