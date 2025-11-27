// app/contact/page.tsx
import React from "react";
import type { Metadata } from "next";
import ContactPage from "../components/UI/Contact";

// ---- CONSTANTS ----
const NAME = "Tariq Medical Centre";
const ADDRESS = "Choa Road, near Bank Alfalah, Kallar Syedan, 46000";
const PHONE = "03335337736";
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";
const URL = `${BASE}/contact`;
const WEBSITE = "https://tariqmedicalcentre.example"; // replace with real website
const GOOGLE_SHORT = "https://share.google/zBZbUaVNUsrQKUJIS";
const INSTAGRAM = "https://www.instagram.com/tariqmedicalcentre_kalarsyedan/";
const FACEBOOK = "https://www.facebook.com/tariqmedicalcentre";
const LOGO = `${BASE}/images/logo.png`;
const OG_IMAGE = `${BASE}/images/og-image.png`;



export const metadata: Metadata = {
  title: `${NAME} — Contact & Location`,
  description:
    "Contact Tariq Medical Centre (Kallar Syedan). Open 24 hours — address, phone, directions, social links and quick actions.",
  keywords: [
    "Tariq Medical Centre",
    "Tariq Medical Centre contact",
    "hospital Kallar Syedan",
    "medical centre",
    "contact number",
  ],
  openGraph: {
    title: `${NAME} — Contact & Location`,
    description:
      "Contact Tariq Medical Centre (Kallar Syedan). Open 24 hours — address, phone, directions, social links and quick actions.",
    url: URL,
    siteName: NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        alt: `${NAME} contact`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — Contact & Location`,
    description:
      "Contact Tariq Medical Centre (Kallar Syedan). Open 24 hours — address, phone, directions, social links and quick actions.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: URL },
};


// ----------------------------------
// PAGE COMPONENT
// ----------------------------------
export default function ContactPageWrapper() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: NAME,
    url: BASE || undefined,
    logo: LOGO,
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Choa Road, near Bank Alfalah",
      addressLocality: "Kallar Syedan",
      postalCode: "46000",
      addressCountry: "PK",
    },
    sameAs: [WEBSITE, GOOGLE_SHORT, INSTAGRAM, FACEBOOK].filter(Boolean),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: PHONE,
        contactType: "customer service",
        areaServed: "PK",
        availableLanguage: ["English", "Urdu"],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPage />
    </>
  );
}
