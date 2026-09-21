import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

async function getDoctors(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}api/doctors`);
  if (!res.ok) return [];
  return res.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const doctors = await getDoctors();

  return doctors.map((doctor) => ({
    url: `${BASE_URL}/doctor/${doctor.slug}`,
    lastModified: doctor.createdAt,
  })); 
}