// app/admin/api/departments/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Department from "@/lib/models/Departments";
import User from "@/lib/models/User";
import { departmentSchema } from "@/lib/validators/departments";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = departmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.message },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      doctors: inputDoctors = [],
      photo,
    } = parsed.data;

    // normalize doctor ids and validate format
    const doctorIds = Array.isArray(inputDoctors)
      ? inputDoctors
          .map((d: any) => String(d))
          .filter((d: string) => mongoose.Types.ObjectId.isValid(d))
      : [];

    // Validate that all provided doctor IDs exist
    if (doctorIds.length) {
      const found = await User.find({
        _id: { $in: doctorIds },
        role: "doctor",
      }).lean();
      if (found.length !== doctorIds.length) {
        return NextResponse.json(
          {
            ok: false,
            error: "One or more doctor IDs are invalid or not a doctor",
          },
          { status: 400 }
        );
      }

      // Ensure none of these doctors already belong to a different department
      const alreadyAssigned = await User.find({
        _id: { $in: doctorIds },
        dept: { $ne: null },
      }).lean();

      if (alreadyAssigned.length) {
        // build friendly message
        const msg = alreadyAssigned
          .map((d) => `${d.name || d.email} (${String(d._id)})`)
          .join(", ");
        return NextResponse.json(
          {
            ok: false,
            error: `These doctors are already assigned to a department: ${msg}`,
          },
          { status: 400 }
        );
      }
    }

    // Create department (doctors array will be the ObjectId list)
    const department = await Department.create({
      name,
      description,
      photo,
      doctors: doctorIds,
    });

    // Update users to set their dept (if any doctors)
    if (doctorIds.length) {
      await User.updateMany(
        { _id: { $in: doctorIds } },
        { $set: { dept: department._id } }
      );
    }

    const populated = await Department.findById(department._id)
      .populate("doctors", "name email slug")
      .lean();
    return NextResponse.json(
      { ok: true, department: populated },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/departments error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const departments = await Department.find().populate(
      "doctors",
      "name email avatar specialty"
    );
    return NextResponse.json({ departments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
