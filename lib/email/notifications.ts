// lib/email/config.ts
import nodemailer from "nodemailer";
import User from "../models/User";
import { format } from "date-fns";
import type { SentMessageInfo } from "nodemailer";
import { emailTemplates } from "./template";


// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email server verification failed:", error);
    return false;
  }
}


interface AppointmentData {
  _id: string;
  patientId: string;
  doctorId: string;
  dateISO: string; // "YYYY-MM-DD" format
  slot: string; // "HH:mm" format
  startTime?: Date | string;
  endTime?: Date | string;
  status: string;
  prescription?: {
    medications?: string[];
    instructions?: string;
  } | null;
}

interface EmailRecipient {
  name: string;
  email: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}










// Helper function to send a single email
async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const info: SentMessageInfo = await transporter.sendMail({
      from: `"Tariq medical centre" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}












// Helper function to fetch user details
async function fetchAppointmentParticipants(
  patientId: string,
  doctorId: string
): Promise<{ patient: EmailRecipient; doctor: EmailRecipient } | null> {
  try {
    const [patient, doctor] = await Promise.all([
      User.findById(patientId).select("name email"),
      User.findById(doctorId).select("name email"),
    ]);

    if (!patient || !doctor) {
      console.error("Patient or doctor not found");
      return null;
    }

    if (!patient.email || !doctor.email) {
      console.error("Patient or doctor email missing");
      return null;
    }

    return {
      patient: { name: patient.name as string, email: patient.email },
      doctor: { name: doctor.name as string, email: doctor.email },
    };
  } catch (error) {
    console.error("Error fetching appointment participants:", error);
    return null;
  }
}











// Helper function to send emails and log results
async function sendNotificationEmails(
  appointmentId: string,
  patientEmail: EmailOptions,
  doctorEmail: EmailOptions,
  notificationType: string
): Promise<void> {
  const [patientResult, doctorResult] = await Promise.allSettled([
    sendEmail(patientEmail),
    sendEmail(doctorEmail),
  ]);

  // // Log patient email result
  // if (patientResult.status === "fulfilled" && patientResult.value.success) {
  //   console.log(
  //     `✓ Patient ${notificationType} sent for appointment ${appointmentId}`,
  //     `(Message ID: ${patientResult.value.messageId})`
  //   );
  // } else {
  //   console.error(
  //     `✗ Failed to send patient ${notificationType}:`,
  //     patientResult.status === "rejected"
  //       ? patientResult.reason
  //       : patientResult.value.error
  //   );
  // }

  // // Log doctor email result
  // if (doctorResult.status === "fulfilled" && doctorResult.value.success) {
  //   console.log(
  //     `✓ Doctor ${notificationType} sent for appointment ${appointmentId}`,
  //     `(Message ID: ${doctorResult.value.messageId})`
  //   );
  // } else {
  //   console.error(
  //     `✗ Failed to send doctor ${notificationType}:`,
  //     doctorResult.status === "rejected"
  //       ? doctorResult.reason
  //       : doctorResult.value.error
  //   );
  // }
}















// Main notification function for appointment status changes
export async function notifyAppointmentStatusChange(
  appointment: AppointmentData,
  action: "confirm" | "complete" | "cancel"
): Promise<void> {
  try {
    // Validate appointment data
    if (!appointment || !appointment._id) {
      console.error("Invalid appointment data");
      return;
    }

    if (!appointment.dateISO) {
      console.error("Appointment dateISO is missing");
      return;
    }

    const participants = await fetchAppointmentParticipants(
      appointment.patientId,
      appointment.doctorId
    );

    if (!participants) {
      console.error("Cannot send notifications - participants not found");
      return;
    }

    const { patient, doctor } = participants;

    // Parse the dateISO string (format: "YYYY-MM-DD")
    const appointmentDate = new Date(appointment.dateISO);
    if (isNaN(appointmentDate.getTime())) {
      console.error("Invalid appointment dateISO:", appointment.dateISO);
      return;
    }

    const formattedDate = format(appointmentDate, "MMMM dd, yyyy");
    const formattedTime = appointment.slot || "Not specified";

    // Determine templates based on action
    let patientTemplate;
    let doctorAction: string;

    switch (action) {
      case "confirm":
        patientTemplate = emailTemplates.appointmentConfirmed(
          patient.name,
          doctor.name,
          formattedDate,
          formattedTime
        );
        doctorAction = "confirmed";
        break;

      case "complete":
        patientTemplate = emailTemplates.appointmentCompleted(
          patient.name,
          doctor.name,
          !!appointment.prescription
        );
        doctorAction = "completed";
        break;

      case "cancel":
        patientTemplate = emailTemplates.appointmentCancelled(
          patient.name,
          doctor.name,
          formattedDate,
          formattedTime
        );
        doctorAction = "cancelled";
        break;

      default:
        console.error("Invalid action type:", action);
        return;
    }

    // Generate doctor template
    const doctorTemplate = emailTemplates.doctorNotification(
      doctor.name,
      patient.name,
      doctorAction,
      formattedDate,
      formattedTime
    );

    // Send emails
    await sendNotificationEmails(
      appointment._id,
      {
        to: patient.email,
        subject: patientTemplate.subject,
        html: patientTemplate.html,
        text: patientTemplate.text,
      },
      {
        to: doctor.email,
        subject: doctorTemplate.subject,
        html: doctorTemplate.html,
        text: doctorTemplate.text,
      },
      `${action} notification`
    );

    // console.log(`✓ Notifications processed for appointment ${appointment._id} - ${action}`);
  } catch (error) {
    console.error("Failed to send appointment notifications:", error);
    throw error;
  }
}

// Send appointment reminders (typically 24 hours before)
export async function sendAppointmentReminder(
  appointment: AppointmentData
): Promise<void> {
  try {
    // Validate appointment data
    if (!appointment || !appointment._id) {
      console.error("Invalid appointment data");
      return;
    }

    if (!appointment.dateISO) {
      console.error("Appointment dateISO is missing");
      return;
    }

    const participants = await fetchAppointmentParticipants(
      appointment.patientId,
      appointment.doctorId
    );

    if (!participants) {
      console.error("Cannot send reminders - participants not found");
      return;
    }

    const { patient, doctor } = participants;

    // Parse the dateISO string (format: "YYYY-MM-DD")
    const appointmentDate = new Date(appointment.dateISO);
    if (isNaN(appointmentDate.getTime())) {
      console.error("Invalid appointment dateISO:", appointment.dateISO);
      return;
    }

    const formattedDate = format(appointmentDate, "MMMM dd, yyyy");
    const formattedTime = appointment.slot || "Not specified";

    // Generate templates
    const patientTemplate = emailTemplates.appointmentReminder(
      patient.name,
      false,
      patient.name,
      doctor.name,
      formattedDate,
      formattedTime
    );

    const doctorTemplate = emailTemplates.appointmentReminder(
      doctor.name,
      true,
      patient.name,
      doctor.name,
      formattedDate,
      formattedTime
    );

    // Send emails
    await sendNotificationEmails(
      appointment._id,
      {
        to: patient.email,
        subject: patientTemplate.subject,
        html: patientTemplate.html,
        text: patientTemplate.text,
      },
      {
        to: doctor.email,
        subject: doctorTemplate.subject,
        html: doctorTemplate.html,
        text: doctorTemplate.text,
      },
      "reminder"
    );

    console.log(`✓ Reminders processed for appointment ${appointment._id}`);
  } catch (error) {
    console.error("Failed to send appointment reminders:", error);
    throw error;
  }
}
