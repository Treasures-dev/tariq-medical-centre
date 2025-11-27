import mongoose, { Schema, model, models, Model, Document } from "mongoose";

/** Explicit TS interface for a Service document */
export interface ServiceDoc extends Document {
  title: string;
  slug: string;
  price: number;
  durationMinutes: number;
  description?: string;
  installmentAvailable: boolean;
  installmentOptions?: {
    parts?: number;
    intervalDays?: number;
    firstPaymentPercent?: number;
  };
  image: string;
  // NEW offer fields
  onOffer: boolean;
  offerPrice?: number;
  offerEnds?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<ServiceDoc>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, default: 0 },
    durationMinutes: { type: Number, required: true, default: 30 },
    description: { type: String },
    installmentAvailable: { type: Boolean, default: false },
    installmentOptions: {
      parts: { type: Number },
      intervalDays: { type: Number },
      firstPaymentPercent: { type: Number },
    },
    image: { type: String },

    onOffer: { type: Boolean, default: false },
    offerPrice: { type: Number }, 
    offerEnds: { type: Date, default: null },
  },
  { timestamps: true }
);


ServiceSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

const ServiceModel: Model<ServiceDoc> =
  (models.Service as Model<ServiceDoc>) ||
  model<ServiceDoc>("Service", ServiceSchema);

export default ServiceModel;
