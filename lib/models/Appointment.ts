// lib/models/Appointment.ts
import mongoose, { Schema, model, models, Document } from "mongoose";

export type PrescriptionType = {
  prescribedBy?: mongoose.Types.ObjectId | string;
  notes?: string;
  medications: string;
  createdAt?: Date;
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  phone: string;
  email?: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName?: string;
  doctorSpecialty?: string;
  type: "online" | "walkin";
  slot: string; // "HH:mm"
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  dateISO: string; // "YYYY-MM-DD"
  notes?: string;
  photoUrl?: string;
  status: AppointmentStatus;
  prescription?: PrescriptionType | null;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema(
  {
    prescribedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    notes: { type: String },
    medications: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorName: { type: String },
    doctorSpecialty: { type: String },
    type: { type: String, enum: ["online", "walkin"], required: true },
    dateISO: { type: String, required: true }, // "YYYY-MM-DD" for canonical compare
    slot: { type: String, required: true }, // "HH:mm"
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30 },
    notes: { type: String },
    photoUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      default: "pending",
    },
    prescription: { type: PrescriptionSchema, default: null },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicates at DB level
AppointmentSchema.index({ doctorId: 1, dateISO: 1, slot: 1 }, { unique: true });

const Appointment =
  (models.Appointment as mongoose.Model<IAppointment>) ||
  model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
