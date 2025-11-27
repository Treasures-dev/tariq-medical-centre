// app/api/admin/pharmacy/[slug]/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import PharmacyModel from "@/lib/models/Pharmacy"; // Your Pharmacy model
import { auth } from "@/auth";
import { headers } from "next/headers";
import { makeProductFilter } from "@/lib/utils";

// GET single product by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    await connectDB();
    const product = await PharmacyModel.findOne(makeProductFilter(slug)).sort({ createdAt: -1 });

    


    return NextResponse.json({ ok: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH - Update product by slug
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const updated = await PharmacyModel.findOneAndUpdate(
      makeProductFilter(slug),
      {
        name: body.name,
        sku: body.sku,
        price: body.price,
        quantity: body.quantity,
        unit: body.unit,
        description: body.description,
        images: body.images,
        usage: body.usage,
        ingredient: body.ingredient,
        expiry: body.expiry ? new Date(body.expiry) : undefined,
        mgf: body.mgf ? new Date(body.mgf) : undefined,
      },
      { new: true }
    );
    console.log(updated);
    

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE product by slug
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const deleted = await PharmacyModel.findOneAndDelete(makeProductFilter(slug));

    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Product deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting product:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}