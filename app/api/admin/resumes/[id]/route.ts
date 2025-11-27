import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Applicant from "@/lib/models/Apllicant";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { backendClient } from "@/lib/edgestore/edge-store-router";
interface ApplicantDoc {
    _id: string;
    name: string;
    email: string;
    phone: string;
    department?: string;
    fileUrl?: string;
  }
  

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    // 1. Admin check
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {id} = await params;
    if (!id)
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );

    // 2. Connect DB and find applicant
    await connectDB();
    const doc = await Applicant.findById(id).lean<ApplicantDoc>();
    if (!doc)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    // 3. Delete file from EdgeStore backend
    if (doc.fileUrl) {
      await backendClient.publicFiles.deleteFile({ url: doc.fileUrl });
    }

    // 4. Delete DB record  
    await Applicant.findByIdAndDelete(id);

    return NextResponse.json({ ok: true, deletedId: id }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE applicant:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
