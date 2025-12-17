// app/services/page.tsx
import React from "react";
import type { Metadata } from "next";
import ServicesClient from "../components/UI/ServicesClient";// adjust path if needed

type RawService = Record<string, any>;

async function fetchServicesForMeta(): Promise<RawService[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const res = await fetch(`${base}/api/services`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    // tolerate several possible shapes
    const arr = json?.services ?? json?.data ?? json ?? [];
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const services = await fetchServicesForMeta();
  const count = services.length;

  const title =
    count > 0
      ? `Services — ${count} Offerings | Tariq Medical Centre`
      : "Services | Tariq Medical Centre";

  const description =
    "Explore Tariq Medical Centre's services — procedures, packages, durations, and prices.";

  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/services`;
  const image = "/images/services-og.png";

  return {
    title,
    description,
    keywords: ["Tariq Medical Centre", "medical services", "procedures", "consultation"],
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          alt: "Services — Tariq Medical Centre",
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
    alternates: {
      canonical: url,
    },
  };
}

export default async function ServicesPage() {
  // fetch services server-side once (for metadata + SSR)
  const services = await fetchServicesForMeta();

  // Normalize a lightweight list for JSON-LD (only serializable fields)
  const list = (services ?? []).map((s: any, i: number) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.title ?? s.name ?? `Service ${i + 1}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/services/${s.slug ?? s._id}`,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Services — Tariq Medical Centre",
    description: "Explore medical services and procedures offered at Tariq Medical Centre.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/services`,
    isPartOf: {
      "@type": "MedicalOrganization",
      name: "Tariq Medical Centre",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: list,
    },
  };

  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-12">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        // server-side JSON-LD injection is safe and recommended
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Pass services as initialData so the client can render immediately and SWR can hydrate */}
      <ServicesClient initialData={services} />
    </main>
  );
}
