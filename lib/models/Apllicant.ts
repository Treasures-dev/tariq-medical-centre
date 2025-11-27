import mongoose from "mongoose";

const ApplicantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true, unique: true },
    phone: { type: String, required: true, index: true, unique: true },
    department: { type: String },
    fileUrl: { type: String, required: true },
  },
  { timestamps: true }
);

// Avoid complex generic typing here to prevent the "union too complex" TS error.
// Export the model plainly; you can still import it and use it in code.
const Applicant =
  (mongoose.models && (mongoose.models as any).Applicant) ||
  mongoose.model("Applicant", ApplicantSchema);

export default Applicant as mongoose.Model<any>;
