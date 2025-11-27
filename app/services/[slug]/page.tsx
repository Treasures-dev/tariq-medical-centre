// app/services/[slug]/page.tsx
import React from "react";
import type { Metadata } from "next";
import ServiceDetailClient from "@/app/components/UI/ServiceDetail";
import { notFound } from "next/navigation";

type RawService = Record<string, any>;

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

async function fetchAllServices(): Promise<RawService[]> {
  try {
    const res = await fetch(`${BASE}/api/services`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    const arr = json?.services ?? json?.data ?? json ?? [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function fetchServiceBySlug(slug: string): Promise<RawService | null> {
  // try direct API first (/api/services/:slug)
  try {
    const res = await fetch(`${BASE}/api/services/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);

      const s = json?.service;

      if (s) return s;
    }
  } catch (err) {
    // ignore and fallback
  }

  // fallback: fetch all and find
  const all = await fetchAllServices();
  const found = all.find((s: any) => {
    const sSlug = (s.slug ?? s.title ?? s.name ?? "").toString();
    if (!sSlug) return false;
    return sSlug === slug;
  });
  return found ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = await fetchServiceBySlug(params.slug);

  if (!service) {
    return {
      title: "Service not found — Tariq Medical Centre",
      description: "Service not found.",
    };
  }

  const title = `${service.title ?? service.name} — Tariq Medical Centre`;
  const description =
    (service.description ?? "").slice(0, 160) ||
    "Medical service at Tariq Medical Centre.";
  const image = service.image ?? service.photo ?? "/images/services-og.png";
  const url = `${BASE}/services/${service.slug ?? service._id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          alt: service.title ?? "Service",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await fetchServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Normalize fields for client + JSON-LD
  const id =
    service._id?.$oid ?? service._id ?? service.id ?? String(Math.random());
  const title = service.title ?? service.name ?? "Service";
  const description = service.description ?? service.summary ?? "";
  const image =
    service.image ??
    service.photo ??
    service.imageUrl ??
    "/images/service-placeholder.jpg";
  const price =
    typeof service.price === "number"
      ? service.price
      : service.price
      ? Number(service.price)
      : undefined;
  const durationMinutes =
    service.durationMinutes ?? service.duration ?? undefined;
  const url = `${BASE}/services/${service.slug ?? id}`;
  const installment = Boolean(
    service.installmentAvailable || service.installmentOptions
  );

  // JSON-LD: Use MedicalProcedure if the service looks procedural, otherwise use Service
  const isProcedureLike = Boolean(
    service.procedure ||
      service.durationMinutes ||
      service.duration ||
      service.price
  );
  const schemaType = isProcedureLike ? "MedicalProcedure" : "Service";

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title,
    description: description,
    url,
    image,
    provider: {
      "@type": "MedicalOrganization",
      name: "Tariq Medical Centre",
      url: BASE || undefined,
    },
  };

  if (price != null) {
    jsonLd["offers"] = {
      "@type": "Offer",
      price: price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    };
  }

  if (durationMinutes) {
    jsonLd["timeRequired"] = `PT${Number(durationMinutes)}M`;
  }

  if (installment) {
    jsonLd["serviceOutput"] = "Installment available";
  }

  // Pass service to client for SSR hydration
  return (
    <main className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailClient initialData={service} />
    </main>
  );
}
