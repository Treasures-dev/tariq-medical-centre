// app/api/admin/applicants/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Applicant from "@/lib/models/Apllicant";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const items = await Applicant.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, data: items }, { status: 200 });
  } catch (err) {
    console.error("GET applicants error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    await connectDB();
    const doc = await Applicant.findByIdAndDelete(id).lean();
    if (!doc) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    // TODO: optionally remove file from edge store using stored key if you saved it
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE applicants error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
