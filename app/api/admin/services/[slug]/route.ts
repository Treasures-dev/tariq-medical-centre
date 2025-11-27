// app/api/services/[slug]/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ServiceModel from "@/lib/models/Service";
import { serviceSchemaWithRefinement } from "@/lib/validators/services";
import { auth } from "@/auth";
import { headers } from "next/headers";







export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {

    const { slug } = await params;
    try {
      await connectDB();
      const service = await ServiceModel.find({slug}).sort({ createdAt: -1 });

      
      return NextResponse.json(({ ok: true, data: service }));
    } catch (error) {
      console.error("Error fetching services:", error);
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
  }

  export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    try {
      await connectDB();
  
      const body = await request.json();
      const parsed = serviceSchemaWithRefinement.parse(body);
  
      const updated = await ServiceModel.findOneAndUpdate(
        { slug },
        {
          title: parsed.title,
          price: parsed.price,
          durationMinutes: parsed.durationMinutes,
          description: parsed.description,
          image: parsed.image,
          onOffer: parsed.onOffer,
          offerPrice: parsed.offerPrice,
          offerEnds: parsed.offerEnds ? new Date(parsed.offerEnds) : undefined,
          installmentAvailable: parsed.installmentAvailable,
          installmentOptions: parsed.installmentOptions,
        },
        { new: true }
      );
  
      if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  
      return NextResponse.json({ ok: true, data: updated });
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
    }
  }

// Optional: DELETE from same file
export async function DELETE(
  request: Request,
  params: { params: Promise<{ slug: string }> }
) {
  const  slug  = await params ;

  const session = await auth.api.getSession({ headers: await headers() });

  try {
    await connectDB();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const deleted = await ServiceModel.findOneAndDelete({ slug });

    if (!deleted)
      return NextResponse.json(
        { ok: false, error: "Service not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { ok: true, message: "Service deleted" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
