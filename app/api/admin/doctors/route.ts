import { NextResponse } from "next/server";
import { doctorSchema } from "@/lib/validators/doctors";
import User from "@/lib/models/User";
import connectDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { headers } from "next/headers";
import mongoose from "mongoose";
import Department from "@/lib/models/Departments";
await import("@/lib/models/Departments");

export async function GET() {
  await connectDB();

  const doctors = await User.find({ role: "doctor" })
    .populate("dept")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, doctors });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  try {
    await connectDB();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = doctorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
    }

    // Build createPayload from validated data
    const createPayload: any = { ...parsed.data };

    // -------------------------------
    // Normalize dept input
    // -------------------------------
    const deptVal = parsed.data.dept ? String(parsed.data.dept).trim() : "";
    let deptDoc: null | any = null;
    if (deptVal) {
      if (mongoose.Types.ObjectId.isValid(deptVal)) {
        deptDoc = await Department.findById(deptVal).lean();
      } else {
        deptDoc = await Department.findOne({ slug: deptVal }).lean();
      }
      if (!deptDoc) {
        return NextResponse.json({ ok: false, error: "Department not found" }, { status: 400 });
      }
      createPayload.dept = deptDoc._id; // safe ObjectId
    } else {
      // No dept provided in request: do NOT set dept to "" or null.
      delete createPayload.dept;
    }

    // -------------------------------
    // Slug generation for doctor
    // If request didn't include slug, create one from doctor's name and ensure uniqueness.
    // -------------------------------
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // remove invalid chars
        .replace(/\s+/g, "-") // replace spaces with -
        .replace(/-+/g, "-"); // collapse dashes

    // derive a base name: prefer parsed.data.name, fallback to first/last or timestamp
    const deriveBaseName = () => {
      if (parsed.data.name && String(parsed.data.name).trim()) return String(parsed.data.name);
      const first = parsed.data.name ?? parsed.data.name ?? "";
      const combo = `${first} ${last}`.trim();
      if (combo) return combo;
      return `doctor-${Date.now().toString(36)}`; // fallback unique-ish
    };

    // only generate if slug not provided in request
    if (!("slug" in createPayload) || !createPayload.slug) {
      const base = slugify(deriveBaseName());
      let candidate = base || `doctor-${Date.now().toString(36)}`;
      let suffix = 0;

      // loop to ensure uniqueness (simple approach)
      // IMPORTANT: This is OK for low concurrency. For high concurrency also add unique index and handle dup-key.
      while (await User.findOne({ slug: candidate })) {
        suffix += 1;
        candidate = `${base}-${suffix}`;
      }

      createPayload.slug = candidate;
    } else {
      // normalize provided slug as well
      createPayload.slug = slugify(String(createPayload.slug));
    }

    // Create the update object by spreading createPayload and forcing role to "doctor"
    const updateObj = {
      ...createPayload,
      role: "doctor",
    };

    // Try to find existing user by email
    const existing = await User.findOne({ email: parsed.data.email }).lean();

    let userDoc: any;
    if (existing) {
      // If request didn't include slug and the existing user has no slug, ensure we set one
      if (!("slug" in parsed.data) && !existing.slug) {
        updateObj.slug = createPayload.slug;
      }

      // Update existing user, keep other fields intact (we used spread)
      userDoc = await User.findOneAndUpdate(
        { email: parsed.data.email },
        { $set: updateObj },
        { new: true, runValidators: true }
      ).lean();

      // Sync Department collections if dept changed (only if request provided a dept)
      if ("dept" in createPayload) {
        const oldDeptId = existing.dept ? String(existing.dept) : null;
        const newDeptId = userDoc.dept ? String(userDoc.dept) : null;

        if (oldDeptId && oldDeptId !== newDeptId) {
          await Department.updateOne({ _id: oldDeptId }, { $pull: { doctors: userDoc._id } });
        }
        if (newDeptId && oldDeptId !== newDeptId) {
          await Department.updateOne({ _id: newDeptId }, { $addToSet: { doctors: userDoc._id } });
        }
      }
    } else {
      // No existing user -> create one
      const createObj: any = { ...createPayload, role: "doctor" };

      // If createObj.dept is undefined (not provided) we leave it out.
      const created = await User.create(createObj);
      userDoc = await User.findById(created._id).lean();

      // If dept was provided, add user to that department's doctors array
      if (deptDoc) {
        await Department.updateOne({ _id: deptDoc._id }, { $addToSet: { doctors: created._id } });
      }
    }

    const populated = await User.findById(userDoc._id).populate("dept", "name slug").lean();
    return NextResponse.json({ ok: true, doctor: populated }, { status: existing ? 200 : 201 });
  } catch (err: any) {
    console.error("POST /api/admin/doctors error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
