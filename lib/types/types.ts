// types.ts
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type Prescription = {
  medications: string;
  notes?: string;
};

export type Doctor = {
  slug: string;
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  dept?: string;
  specialty?: string;
  availability?: Array<{
    day: string;
    from: string;
    to: string;
    telehealth: boolean;
    notes?: string;
  }>;
};

export type Appointment = {
  durationMinutes: any;
  doctorSpecialty: any;
  createdAt: any;
  slot: string;
  dateISO: any;
  patientId: any;
  _id: string;
  doctorAvatar: string | undefined;
  patientAvatar: string | undefined;
  doctorEmail: string;
  doctorPhone: string;
  id: string;
  patientName: string;
  phone: string;
  type: "online" | "walkin";
  date: Date | string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  photoUrl?: string;
  doctorId?: string;
  doctorName?: string;
  prescription?: Prescription;
};

export type FormValues = {
  patientName: string;
  phone: string;
  email?: string;
  type: "online" | "walkin";
  date: string;
  timeSlot: string;
  notes?: string;
  photoUrl?: string;
  doctorId?: string;
};


export type RouteParams = { params: Promise<{ slug: string }> };