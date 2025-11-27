import mongoose, { Schema, model, models, Model, Document } from "mongoose";
import slugify from "slugify";
import connectDB from "@/lib/mongoose";

export interface PharmacyItemDoc extends Document {
  name: string;
  slug: string;
  sku?: string;
  price: number;
  quantity: number;
  unit: string;
  description?: string;
  images: string[];
  usage?: string;
  ingredient?: string;
  expiry?: string;
  mgf?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PharmacyItemSchema = new Schema<PharmacyItemDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "pcs" },
    description: { type: String },
    images: { type: [String], default: [] },
    usage: { type: String },
    ingredient: { type: String },
    expiry: { type: String },
    mgf: { type: String },
  },
  { timestamps: true, collection: "pharmacy_items" }
);

/** generateUniqueSlug for pharmacy items */
async function generateUniqueSlug(doc: PharmacyItemDoc) {
  const base = (doc.name && doc.name.trim()) ? doc.name.trim() : "product";
  let candidate = slugify(base, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  if (!candidate || candidate.length === 0) {
    candidate = `product-${Date.now()}`;
  }

  const PharmacyItem = mongoose.models.PharmacyItem as Model<PharmacyItemDoc>;
  let unique = candidate;
  let counter = 0;
  while (true) {
    const existing = await PharmacyItem.findOne({ slug: unique }).lean().exec();
    if (!existing || (doc._id && String(existing._id) === String(doc._id))) break;
    counter += 1;
    unique = `${candidate}-${counter}`;
  }
  return unique;
}

/** Pre-validate hook to auto-generate slug */
PharmacyItemSchema.pre<PharmacyItemDoc>("validate", async function (next) {
  try {
    await connectDB();
  } catch (err) {
    // safe to ignore
  }

  if (!this.slug || this.isModified("name")) {
    this.slug = await generateUniqueSlug(this);
  }

  next();
});

const PharmacyItemModel: Model<PharmacyItemDoc> =
  (models.PharmacyItem as Model<PharmacyItemDoc>) ||
  model<PharmacyItemDoc>("PharmacyItem", PharmacyItemSchema);

export default PharmacyItemModel;
