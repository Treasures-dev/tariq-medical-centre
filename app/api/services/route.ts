// app/api/services/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ServiceModel from "@/lib/models/Service";
import { serviceSchemaWithRefinement } from "@/lib/validators/services";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  try {
    await connectDB();
   
    const services = await ServiceModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, data: services }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

