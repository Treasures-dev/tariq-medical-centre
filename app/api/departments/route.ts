import Department from "@/lib/models/Departments";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      await connectDB();
    
      const departments = await Department.find().populate(
        "doctors",
        "name email avatar specialty"
      );
      return NextResponse.json({ departments });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  