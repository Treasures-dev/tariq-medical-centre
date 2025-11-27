import { auth } from "@/auth";
import Appointment from "@/lib/models/Appointment";
import connectDB from "@/lib/mongoose";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
  
    await connectDB();
  

    const appointments = await Appointment.find()
      .sort({ date: -1 })
      .lean();
  
    return NextResponse.json({ success: true, appointments });
  }