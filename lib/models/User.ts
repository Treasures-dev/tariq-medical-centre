// src/models/User.ts
import mongoose, { Collection, Document, Model } from "mongoose";
import slugify from "slugify";
import connectDB from "@/lib/mongoose";

export type Role = "user" | "doctor" | "admin";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface IAvailabilitySlot {
  day: Weekday;
  from: string; // "09:00"
  to: string; // "13:00"
  telehealth?: boolean;
  notes?: string | null;
}

export interface IService {
  name: string;
  price: number;
  _id: any;
}

export interface IUser extends Document {
  name?: string | null;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  role: Role;
  slug: string;
  bio?: string | null;
  specialty?: string | null;
  dept?: mongoose.Types.ObjectId | string | null;
  availability?: IAvailabilitySlot[];
  provider?: string | null;
  qualifications: string[];
  services?: IService;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, trim: true, default: null },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },
    slug: { type: String, required: true, unique: true },
    bio: { type: String, default: null },
    specialty: { type: String, default: null },
    qualifications: { type: [String], default: [] },
    services: { type: [serviceSchema], default: [] },
    dept: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department", // <-- reference Department model
      default: null,
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },

        from: { type: String, required: true },
        to: { type: String, required: true },
      },
      { _id: false }
    ],

    provider: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "user" }
);

/** generateUniqueSlug similar to before */
async function generateUniqueSlug(doc: IUser) {
  const base =
    doc.name && doc.name.trim() ? doc.name.trim() : doc.email.split("@")[0];
  let candidate = slugify(base, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
  if (!candidate || candidate.length === 0) {
    candidate = `user-${Date.now()}`;
  }

  const User = mongoose.models.User as Model<IUser>;
  let unique = candidate;
  let counter = 0;
  while (true) {
    const existing = await User.findOne({ slug: unique }).lean().exec();
    if (!existing || (doc._id && String(existing._id) === String(doc._id)))
      break;
    counter += 1;
    unique = `${candidate}-${counter}`;
  }
  return unique;
}

UserSchema.pre<IUser>("validate", async function (next) {
  try {
    await connectDB();
  } catch (err) {
    // continue — connection can be established elsewhere
  }

  if (!this.slug || this.isModified("name") || this.isModified("email")) {
    this.slug = await generateUniqueSlug(this);
  }
  next();
});

const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema, "user");
export default User;
