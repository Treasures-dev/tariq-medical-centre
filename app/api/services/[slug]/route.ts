import ServiceModel from "@/lib/models/Service";
import connectDB from "@/lib/mongoose";
import { makeServiceFilter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
  
    try {
      await connectDB();
  
      // Return a SINGLE service object
      const service = await ServiceModel.findOne(makeServiceFilter(slug)).lean()
  
      if (!service) {
        return NextResponse.json(
          { ok: false, error: "Service not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ ok: true, service });
    } catch (error) {
      console.error("Error fetching service:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to fetch service" },
        { status: 500 }
      );
    }
  }
  