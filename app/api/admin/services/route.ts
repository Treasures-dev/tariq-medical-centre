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
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const services = await ServiceModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, data: services }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  try {

    await connectDB();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }


    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

    // validate (this will enforce onOffer => offerPrice < price)
    let parsed;
    try {
      parsed = serviceSchemaWithRefinement.parse(body);
    } catch (zErr: any) {
      return NextResponse.json({ ok: false, error: zErr.errors ?? zErr.message }, { status: 400 });
    }

    const doc = await ServiceModel.create({
      title: parsed.title,
      slug: parsed.slug ?? undefined,
      price: parsed.price,
      durationMinutes: parsed.durationMinutes,
      description: parsed.description ?? undefined,
      installmentAvailable: parsed.installmentAvailable ?? false,
      installmentOptions: parsed.installmentOptions ?? undefined,
      image: parsed.image ?? "",
      onOffer: parsed.onOffer ?? false,
      offerPrice: parsed.offerPrice ?? undefined,
      offerEnds: parsed.offerEnds ? new Date(parsed.offerEnds) : undefined,
    });

    return NextResponse.json({ ok: true, data: doc }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err?.code === 11000) {
      return NextResponse.json({ ok: false, error: "Duplicate key" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
