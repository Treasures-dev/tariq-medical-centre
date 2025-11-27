import mongoose, { Schema, Document, Model, models } from "mongoose";
import slugify from "slugify";
import connectDB from "@/lib/mongoose";

export interface IDepartment extends Document {
  name: string;
  photo?: string;
  slug: string;
  description?: string;
  doctors: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Department schema
const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    photo: { type: String },
    doctors: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

/** Generate unique slug */
async function generateUniqueSlug(doc: IDepartment) {
  const base = doc.name.trim();
  let candidate = slugify(base, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  if (!candidate || candidate.length === 0) {
    candidate = `department-${Date.now()}`;
  }

  let unique = candidate;
  let counter = 0;
  while (true) {
    const existing = await Department.findOne({ slug: unique }).lean().exec();
    if (!existing || (doc._id && String(existing._id) === String(doc._id))) break;
    counter += 1;
    unique = `${candidate}-${counter}`;
  }
  return unique;
}

// Pre-save hook for slug
DepartmentSchema.pre<IDepartment>("validate", async function (next) {
  try {
    await connectDB();
  } catch (err) {
    console.warn("DB connection failed in Department pre-validate:", err);
  }

  if (!this.slug || this.isModified("name")) {
    this.slug = await generateUniqueSlug(this);
  }
  next();
});

const Department: Model<IDepartment> =
  models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
