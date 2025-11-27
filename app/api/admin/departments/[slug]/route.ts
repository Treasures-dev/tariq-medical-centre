// api/admin/departments/[slug]
import { NextRequest, NextResponse } from "next/server";
import Department from "@/lib/models/Departments";
import connectDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { headers } from "next/headers";
import mongoose from "mongoose";
import User from "@/lib/models/User";
import { departmentSchema } from "@/lib/validators/departments";
import { RouteParams } from "@/lib/types/types";
import { makeDepartmentFilter } from "@/lib/utils";

// ------------------- GET -------------------
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }
    

    const department = await Department.findOne(makeDepartmentFilter(slug))
      .populate("doctors")
      .lean();

    if (!department) {
      return NextResponse.json({ ok: false, error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, department });
  } catch (err: any) {
    console.error("GET /api/admin/departments/[slug] error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// ------------------- PATCH -------------------
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const parsed = departmentSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
    }

    const { name, description, doctors: incomingDoctors , photo } = parsed.data;

    const department = await Department.findOne(makeDepartmentFilter(slug));
    if (!department) return NextResponse.json({ ok: false, error: "Department not found" }, { status: 404 });

    // If only updating name/description
    if (typeof incomingDoctors === "undefined") {
      if (typeof name !== "undefined") department.name = name;
      if (typeof description !== "undefined") department.description = description;
      await department.save();
      const populated = await Department.findById(department._id).populate("doctors", "name email slug").lean();
      return NextResponse.json({ ok: true, department: populated });
    }

    // Normalize incoming ids -> only keep valid ObjectId strings
    const incomingIds = Array.isArray(incomingDoctors)
      ? incomingDoctors.map((d: any) => String(d)).filter(id => mongoose.Types.ObjectId.isValid(id))
      : [];

    // validate they exist & are doctors
    if (incomingIds.length) {
      const found = await User.find({ _id: { $in: incomingIds }, role: "doctor" }).lean();
      if (found.length !== incomingIds.length) {
        return NextResponse.json({ ok: false, error: "One or more doctor IDs are invalid or not a doctor" }, { status: 400 });
      }
    }

    const oldDoctorIds = (department.doctors || []).map((d: any) => String(d));

    // compute diffs
    const toAdd = incomingIds.filter(id => !oldDoctorIds.includes(id));
    const toRemove = oldDoctorIds.filter(id => !incomingIds.includes(id));


    let assignedElsewhere: any[] = [];
    if (toAdd.length) {
      assignedElsewhere = await User.find({
        _id: { $in: toAdd },
        dept: { $nin: [null, department._id] } // dept is neither null nor this dept => assigned elsewhere
      }).lean();
    }

    if (assignedElsewhere.length) {
      const msg = assignedElsewhere.map(d => `${d.name || d.email} (${String(d._id)})`).join(", ");
      return NextResponse.json({ ok: false, error: `These doctors are already assigned to other departments: ${msg}` }, { status: 400 });
    }

    // 1) remove dept from removed users (only if they still point to this dept)
    if (toRemove.length) {
      const removeRes = await User.updateMany(
        { _id: { $in: toRemove }, dept: department._id },
        { $set: { dept: null } }
      );
  
    }

    // 2) set dept on added users
    if (toAdd.length) {
      // Use updateMany to set dept on all toAdd
      const setRes = await User.updateMany(
        { _id: { $in: toAdd } },
        { $set: { dept: department._id } }
      );
    
    }

    // 3) update department document doctors list and name/description
    department.name = typeof name !== "undefined" ? name : department.name;
    department.description = typeof description !== "undefined" ? description : department.description;
    department.doctors = incomingIds;
    department.photo = photo
    await department.save();

    const populated = await Department.findById(department._id).populate("doctors", "name email slug").lean();
    return NextResponse.json({ ok: true, department: populated });
  } catch (err: any) {
    console.error("PATCH /api/admin/departments/[slug] error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
// ------------------- DELETE -------------------
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

    const department = await Department.findOneAndDelete(makeDepartmentFilter(slug));

    if (!department) {
      return NextResponse.json({ ok: false, error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Department deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/admin/departments/[slug] error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
