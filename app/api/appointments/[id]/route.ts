// app/api/appointments/[id]/route.ts
import { NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import connectDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { notifyAppointmentStatusChange } from "@/lib/email/notifications";

type PatchBody = {
  action?: "confirm" | "complete" | "cancel";
  prescription?: {
    medications?: string;
    meds?: string;
    notes?: string;
  };
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  if (session.user.role !== "doctor" && session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing appointment id" }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.action && !body.prescription) {
    return NextResponse.json({ 
      success: false, 
      error: "Nothing to update. Provide `action` or `prescription`." 
    }, { status: 400 });
  }

  if (body.action && !["confirm", "complete", "cancel"].includes(body.action)) {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  }

  if (body.prescription) {
    const meds = body.prescription.medications || body.prescription.meds;
    const notes = body.prescription.notes;
    
    if ((!meds || String(meds).trim() === "") && (!notes || String(notes).trim() === "")) {
      return NextResponse.json({ 
        success: false, 
        error: "Prescription must include medications/meds or notes" 
      }, { status: 400 });
    }
  }

  try {
    await connectDB();

    const appt = await Appointment.findById(id);
    if (!appt) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    if (String(appt.doctorId) !== String(session.user.id) && session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        error: "Not authorized for this appointment" 
      }, { status: 403 });
    }

    // Track if status changed to send notification
    let statusChanged = false;
    let actionType: "confirm" | "complete" | "cancel" | null = null;

    // Apply action (status changes)
    if (body.action) {
      if (body.action === "confirm" && appt.status !== "confirmed") {
        appt.status = "confirmed";
        statusChanged = true;
        actionType = "confirm";
      } else if (body.action === "complete" && appt.status !== "completed") {
        appt.status = "completed";
        statusChanged = true;
        actionType = "complete";
      } else if (body.action === "cancel" && appt.status !== "cancelled") {
        appt.status = "cancelled";
        statusChanged = true;
        actionType = "cancel";
      }
    }

    // Attach/update prescription if present
    if (body.prescription) {
      const medications = body.prescription.medications || body.prescription.meds || "";
      const notes = body.prescription.notes || "";

      appt.prescription = {
        medications,
        notes,
        prescribedBy: session.user.id,
        createdAt: new Date(),
      };

      appt.markModified('prescription');
    }

    await appt.save();

    // Send notifications if status changed
    if (statusChanged && actionType) {
      // Send notifications asynchronously (don't wait for them)
      notifyAppointmentStatusChange(appt as any, actionType as any).catch(err => {
        console.error('Failed to send notifications:', err);
      });
    }

    return NextResponse.json({ 
      success: true, 
      appointment: appt,
      prescription: appt.prescription 
    }, { status: 200 });

  } catch (err: any) {
    console.error("Error updating appointment:", err);
    return NextResponse.json({ 
      success: false, 
      error: err?.message || "Server error" 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  if (session.user.role !== "doctor" && session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing appointment id" }, { status: 400 });
  }

  try {
    await connectDB();

    const appt = await Appointment.findById(id);
    if (!appt) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    if (String(appt.doctorId) !== String(session.user.id) && session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false, 
        error: "Not authorized for this appointment" 
      }, { status: 403 });
    }

    await Appointment.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: "Appointment deleted successfully" 
    }, { status: 200 });

  } catch (err: any) {
    console.error("Error deleting appointment:", err);
    return NextResponse.json({ 
      success: false, 
      error: err?.message || "Server error" 
    }, { status: 500 });
  }
} 