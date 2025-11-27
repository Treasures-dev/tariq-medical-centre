// src/lib/mongoose.ts
import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGO_URI!;
if (!MONGODB_URL) {
  throw new Error("Please define the MONGODB_URL environment variable inside .env");
}

// In development, use a global to preserve the value across module reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

let mongoosePromise: Promise<typeof mongoose>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGODB_URL);
  }
  mongoosePromise = global._mongoosePromise;
} else {
  mongoosePromise = mongoose.connect(MONGODB_URL);
}

export default async function connectDB() {
  const m = await mongoosePromise;
  return m;
}
