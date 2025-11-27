import React from "react";
import type { Metadata } from "next";
import DepartmentListClient from "../components/UI/DepartmentClient";// ensure path matches your project structure

async function fetchDepartmentsForMeta() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/departments`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    const arr = json?.departments ?? json?.data ?? json ?? [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const depts = (await fetchDepartmentsForMeta()) ?? [];
  const count = depts.length;
  const title =
    count > 0
      ? `Departments — ${count} Specialities | Tariq Medical Centre`
      : "Departments | Tariq Medical Centre";
  const description =
    `"Explore Tariq Medical Centre's departments — view specialties, services and contact details for each department."`;
  const image = "/images/departments-og.png"; // fallback OG image — replace if you have one
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/departments`;

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
          alt: "Departments — Tariq Medical Centre",
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
export default async function DepartmentsPage() {
  const depts = await fetchDepartmentsForMeta();
  const list = (depts ?? []).map((d: any, index: number) => ({
    "@type": "ListItem",
    position: index + 1,
    name: d.name,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/departments/${d.slug ?? d._id}`,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Departments — Tariq Medical Centre",
    description: "Explore medical specialties offered at Tariq Medical Centre.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/departments`,
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

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DepartmentListClient />
    </main>
  );
}