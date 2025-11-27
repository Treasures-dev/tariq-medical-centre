// app/api/join-team/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Applicant from "@/lib/models/Apllicant";
import { applicant } from "@/lib/validators/applicant";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    let parsed;
    try {
      parsed = applicant.parse(body);
    } catch (zError: any) {
      return NextResponse.json(
        { ok: false, error: zError.errors ?? zError.message },
        { status: 400 }
      );
    }

    await connectDB();

    const exists = await Applicant.findOne({
      $or: [{ email: parsed.email }, { phone: parsed.phone }],
    }).lean();

    if (exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "A CV was already submitted with this email or phone.",
        },
        { status: 409 }
      );
    }

    const doc = await Applicant.create({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      department: parsed.department ?? undefined,
      fileUrl: parsed.fileUrl,
    });

    return NextResponse.json({ ok: true, data: doc }, { status: 201 });
  } catch (err: any) {
    console.error("join-team POST error:", err);
    if (err?.code === 11000) {
      return NextResponse.json(
        { ok: false, error: "Duplicate key" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
