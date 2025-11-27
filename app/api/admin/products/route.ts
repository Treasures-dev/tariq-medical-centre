// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import PharmacyItemModel from "@/lib/models/Pharmacy";
import { pharmacySchema } from "@/lib/validators/pharmacy";
import { headers } from "next/headers";
import { auth } from "@/auth";

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

    const products = await PharmacyItemModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, data: products }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/products error:", err);
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
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate request body with zod
    let parsed;
    try {
      parsed = pharmacySchema.parse(body);
    } catch (zErr: any) {
      // zod error -> return details
      return NextResponse.json({ ok: false, error: zErr.errors ?? zErr.message }, { status: 400 });
    }

    const doc = await PharmacyItemModel.create({
      name: parsed.name,
      sku: parsed.sku ?? undefined,
      price: parsed.price ?? 0,
      quantity: parsed.quantity ?? 0,
      unit: parsed.unit ?? "pcs",
      description: parsed.description ?? "",
      images: Array.isArray(parsed.images) ? parsed.images : [],
      usage: parsed.usage ?? "",
      ingredient: parsed.ingredient ?? "",
      mgf:parsed.mgf ?? "",
      expiry:parsed.expiry ?? ""

    });

    return NextResponse.json({ ok: true, data: doc }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
