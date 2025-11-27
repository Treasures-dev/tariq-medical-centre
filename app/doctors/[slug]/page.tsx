import DoctorDetailsClient from "@/app/components/UI/DoctorDetailClient";
import type { Metadata } from "next";
import React from "react";

// Fetch doctor by slug (server-side)
async function fetchDoctorBySlug(slug: string) {
  if (!slug) return null;

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const url = `${base}/api/admin/doctors/${encodeURIComponent(slug)}`;

  const res = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return null;

  const json = await res.json().catch(() => ({}));
  return json?.doctor ?? json ?? null;
}


/* -----------------------------------------------------------------------
   DYNAMIC METADATA (Next.js App Router)
------------------------------------------------------------------------ */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const {slug} = await params;
  const doctor = await fetchDoctorBySlug(slug);

  const name = doctor?.name ?? "Doctor";
  const specialty = doctor?.specialty ?? "Medical Specialist";
  const image = doctor?.avatar ?? "/images/placeholder.jpg";
  const bio =
    doctor?.bio ??
    `View complete profile, specialties, experience, clinic timings and book appointments with Dr. ${name}.`;

  const title = `Dr. ${name} — ${specialty} | Tariq Medical Centre`;
  const description = `About ${name} - ${bio}`;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/doctors/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: [
        {
          url: image,
          width: 800,
          height: 800,
          alt: `Dr. ${name}`,
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

/* -----------------------------------------------------------------------
   PAGE (renders JSON-LD + client component)
------------------------------------------------------------------------ */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const {slug} = await params;
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const doctor = await fetchDoctorBySlug(slug);

  // Build JSON-LD safely
  const doctorUrl = `${base}/doctors/${encodeURIComponent(slug)}`;
  const image = doctor?.avatar ? (doctor.avatar.startsWith("http") ? doctor.avatar : `${base}${doctor.avatar}`) : `${base}/images/placeholder.jpg`;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor?.name ?? undefined,
    url: doctorUrl,
    image,
    description: doctor?.bio ?? doctor?.summary ?? undefined,
    medicalSpecialty: doctor?.specialty ?? undefined,
    // include publicly-intended contact info only
    telephone: doctor?.phone || undefined,
    email: doctor?.email || undefined,
    // Link to parent organization (your clinic)
    worksFor: {
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
  };

  // Optionally add sameAs (social profiles) if available and public
  if (Array.isArray(doctor?.sameAs) && doctor.sameAs.length) {
    jsonLd.sameAs = doctor.sameAs;
  } else if (doctor?.website) {
    jsonLd.sameAs = [doctor.website];
  }

  const cleanedJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedJsonLd) }}
      />

      <main className="py-10 px-4">
        <DoctorDetailsClient slug={slug} initialData={doctor} />
      </main>
    </>
  );
}
