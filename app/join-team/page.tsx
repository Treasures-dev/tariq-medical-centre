
import JoinTeamClient from "../components/UI/JoinUs";
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Join Our Team — Tariq Medical Centre";
  const description =
    "Apply to join Tariq Medical Centre. Upload your CV (PDF, DOC, DOCX, PNG, JPG). We're hiring across departments.";
  const url = `${BASE}/join-team`;
  const image = `${BASE}/images/careers-banner.jpg`;

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
          width: 1200,
          height: 630,
          alt: "Join Tariq Medical Centre",
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

export default function Page() {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tariq Medical Centre",
    url: BASE || undefined,
    logo: `${BASE}/images/logo.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+92-000-0000000",
        contactType: "customer service",
        areaServed: "PK",
        availableLanguage: ["English", "Urdu"],
      },
    ],
  };

  const applyLd = {
    "@context": "https://schema.org",
    "@type": "ApplyAction",
    name: "Submit CV",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE}/join-team`,
      actionPlatform: "http://schema.org/WebApplication",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify([orgLd, applyLd]) }}
      />
      <JoinTeamClient />
    </>
  );
}
