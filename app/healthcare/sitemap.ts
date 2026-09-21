
import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

async function getServices() {
  const res = await fetch(`${BASE_URL}api/services`);
  if (!res.ok) return [];
  return res.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  return services.map((service: any) => ({
    url: `${BASE_URL}/healthcare/${service.slug}`,
    lastModified: service.createdAt,
  }));
}
