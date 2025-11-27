
import { clsx, type ClassValue } from "clsx";
import mongoose from "mongoose";
import { Dosis, Michroma, SUSE } from "next/font/google";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeDoctorFilter(slug: string) {
  // If slug looks like mongoDb id then let search by either slug or _id we did it with $or of mongoDB
  if (mongoose.Types.ObjectId.isValid(slug)) {
    return { $or: [{ slug }, { _id: slug }], role: "doctor" };
  }
  // Otherwise return simple slug and doc role
  return { slug, role: "doctor" };
}

export function makeDepartmentFilter(slug: string) {
  if (mongoose.Types.ObjectId.isValid(slug)) {
    return { $or: [{ slug }, { _id: slug }] };
  }
  return { slug };
}

export function makeServiceFilter(slug: string) {
  if (mongoose.Types.ObjectId.isValid(slug)) {
    return { $or: [{ slug }, { _id: slug }] };
  }
  return { slug };
}


export function makeProductFilter(slug: string) {
  if (mongoose.Types.ObjectId.isValid(slug)) {
    return { $or: [{ slug }, { _id: slug }] };
  }
  return { slug };
}


export const MichromaFont = Michroma({
  subsets: ["latin"],
  weight:"400"
});

export const SuseFont = SUSE({
  subsets: ["latin"],
  weight:"400"
});

export const DodisFont = Dosis({
  subsets: ["latin"],
  weight:"600"
});
