// app/about/page.tsx
import React from "react";
import type { Metadata } from "next";
import AboutClient from "../components/UI/AboutClient";

const NAME = "Tariq Medical Centre";
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";
const URL = `${BASE}/about`;
const LOGO = `${BASE}/images/logo.png`;
const OG_IMAGE = `${BASE}/images/about-og.png`;
const PHONE = "03335337736";
const INSTAGRAM = "https://www.instagram.com/tariqmedicalcentre_kalarsyedan/";
const FACEBOOK = "https://www.facebook.com/tariqmedicalcentre";

// Direct metadata (no async generateMetadata)
export const metadata: Metadata = {
  title: `${NAME} — About Us`,
  description:
    "Learn about Tariq Medical Centre — our mission, vision, history and team. Trusted healthcare in Kallar Syedan, Rawalpindi.",
  keywords: ["Tariq Medical Centre", "About Us", "hospital Kallar Syedan", "medical centre"],
  openGraph: {
    title: `${NAME} — About Us`,
    description:
      "Learn about Tariq Medical Centre — our mission, vision, history and team. Trusted healthcare in Kallar Syedan, Rawalpindi.",
    url: URL,
    siteName: NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        alt: `${NAME} — About`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — About Us`,
    description:
      "Learn about Tariq Medical Centre — our mission, vision, history and team. Trusted healthcare in Kallar Syedan, Rawalpindi.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: URL },
};

export default function AboutPageWrapper() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: NAME,
    url: BASE || undefined,
    logo: LOGO,
    telephone: PHONE,
    sameAs: [INSTAGRAM, FACEBOOK].filter(Boolean),
    description:
      "Tariq Medical Centre is a full-service medical facility in Kallar Syedan offering outpatient, inpatient and emergency care with a focus on patient-first compassionate services.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
