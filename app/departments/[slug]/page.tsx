// app/departments/[slug]/page.tsx
import React from "react";
import type { Metadata } from "next";
import DepartmentDetailsClient from "@/app/components/UI/DepartmentDetails"; // adjust path if needed

type DeptAPIShape = any; // loose typing for server fetch

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

async function fetchDeptBySlug(
  slug: string | undefined
): Promise<DeptAPIShape | null> {
  if (!slug) return null;
  try {
    const res = await fetch(`${BASE}/api/departments/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    const d = json?.department;
    if (d) return d;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params?.slug;
  const dept = await fetchDeptBySlug(slug);

  const name = dept?.name ?? "Department";
  const description =
    dept?.description ?? "Explore this department at Tariq Medical Centre.";
  const imagePath = dept?.photo ?? "/images/placeholder.jpg";
  const imageUrl = imagePath?.startsWith("http")
    ? imagePath
    : `${BASE}${imagePath}`;

  const title = `${name} — Department | Tariq Medical Centre`;
  const url = `${BASE}/departments/${slug ?? ""}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: `${name} | Tariq Medical Centre`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Page component: server fetches the department (again) and renders:
 * - JSON-LD script (server-rendered)
 * - DepartmentDetailsClient with initialData prop to avoid duplicate client fetches
 */
export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const {slug} = await params;
  const dept = await fetchDeptBySlug(slug);

  // Build a lightweight JSON-LD for the department
  const deptId =
    dept?._id ?? dept?.id ?? slug ?? `${BASE}/departments/${slug ?? ""}`;
  const imagePath = dept?.photo ?? "/images/placeholder.jpg";
  const imageUrl = imagePath?.startsWith("http")
    ? imagePath
    : `${BASE}${imagePath}`;

  const doctorItems =
    Array.isArray(dept?.doctors) && dept.doctors.length
      ? dept.doctors.map((doc: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Physician",
            name: doc?.name ?? undefined,
            url: doc?.slug ? `${BASE}/doctors/${doc.slug}` : undefined,
            image: doc?.avatar
              ? doc.avatar.startsWith("http")
                ? doc.avatar
                : `${BASE}${doc.avatar}`
              : undefined,
          },
        }))
      : [];

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "MedicalSpecialty", // department-ish entity
    name: dept?.name ?? "Department",
    description: dept?.description ?? undefined,
    url: `${BASE}/departments/${encodeURIComponent(slug ?? "")}`,
    image: imageUrl,
    isPartOf: {
      "@type": "MedicalOrganization",
      name: "Tariq Medical Centre",
      url: BASE || undefined,
      logo: `${BASE}/images/logo.png`,
    },
  };

  if (doctorItems.length) {
    jsonLd.doctors = doctorItems.map((li: any) => li.item); // optional field
    jsonLd.mainEntity = {
      "@type": "ItemList",
      itemListElement: doctorItems,
    };
  }

  return (
    <>
      {/* JSON-LD for search engines */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Pass initialData so the client component can use it and avoid a second fetch */}
          <DepartmentDetailsClient
            slug={slug}
            initialData={dept ? { department: dept } : undefined}
          />
        </div>
      </main>
    </>
  );
}
