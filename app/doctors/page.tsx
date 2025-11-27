import React from "react";
import type { Metadata } from "next";
import DoctorsClient from "../components/UI/DoctorClient"; // adjust path if needed

export const metadata: Metadata = {
  title: "Our Doctors | Tariq Medical Centre",
  description:
    "Meet the experienced and trusted doctors at Tariq Medical Centre, Kallar Syedan, Rawalpindi.",
  openGraph: {
    title: "Our Doctors | Tariq Medical Centre",
    description:
      "Meet the experienced and trusted doctors at Tariq Medical Centre, Kallar Syedan, Rawalpindi.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/doctors`,
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 600,
        alt: "Tariq Medical Centre Logo",
      },
    ],
  },
};

async function fetchDoctors() {
  try {
    // When running as a server component it is safer to use an absolute URL.
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const res = await fetch(`${base}/api/doctors`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const raw = json?.doctors ?? json?.data ?? json ?? [];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const doctors = await fetchDoctors();

  // Build ItemList for JSON-LD (ordered)
  const itemListElements = (doctors ?? []).map((d: any, idx: number) => {
    const slug = d.slug ?? d.id ?? d._id ?? "";
    const doctorUrl = `${base}/doctors/${encodeURIComponent(slug)}`;

    return {
      "@type": "ListItem",
      position: idx + 1,
      url: doctorUrl,
      item: {
        "@type": "Physician",
        name: d.name || d.fullName || "",
        url: doctorUrl,
        image: d.avatar || d.photo || `${base}/images/placeholder.jpg`,
        email: d.email || undefined,
        medicalSpecialty:
          d.specialty || (d.speciality ? d.speciality : undefined) || undefined,
        description: d.summary || d.bio || undefined,
      },
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Our Doctors — Tariq Medical Centre",
    description:
      "Meet the experienced and trusted doctors at Tariq Medical Centre, Kallar Syedan, Rawalpindi.",
    url: `${base}/doctors`,
    isPartOf: {
      "@type": "MedicalOrganization",
      name: "Tariq Medical Centre",
      url: base || undefined,
      logo: `${base}/images/logo.png`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Kallar Syedan",
        addressLocality: "Rawalpindi",
        addressRegion: "Punjab",
        addressCountry: "PK",
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: itemListElements,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="py-10 px-4">
        <DoctorsClient initialData={doctors} />
      </main>
    </>
  );
}
