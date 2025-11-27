import type { Metadata } from "next";
import { Geist, Geist_Mono, Dosis, SUSE } from "next/font/google";
import { Michroma } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/UI/Navbar";
import WhatsAppFab from "./components/UI/Whatsapp";
import Footer from "./components/UI/Footer";
import { EdgeStoreProvider } from "@/lib/edgestore/edgestore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const PROD_BASE = process.env.NEXT_PUBLIC_BASE_URL as string 

export const metadata: Metadata = {
  title: {
    default: 'Tariq Medical Centre - Hospital in Kallar Syedan',
    template: '%s | Tariq Medical Centre'
  },
  description: 'Tariq Medical Centre is a trusted hospital and medical complex in Kallar Syedan, located near Bank Alfalah on Choa Road. Providing quality healthcare services with 5.0 Google rating.',
  keywords: [
    'Tariq Medical Centre',
    'hospital Kallar Syedan',
    'medical centre Kallar Syedan',
    'healthcare Kallar Syedan',
    'medical complex',
    'hospital near Bank Alfalah',
    'Choa Road hospital',
    'Pakistan hospital',
    'medical services Kallar Syedan'
  ],
  authors: [{ name: 'Tariq Medical Centre' }],
  creator: 'Tariq Medical Centre',
  publisher: 'Tariq Medical Centre',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  metadataBase: new URL(PROD_BASE),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tariq Medical Centre - Quality Healthcare in Kallar Syedan',
    description: 'Trusted hospital and medical complex in Kallar Syedan. Located near Bank Alfalah on Choa Road. Rated 5.0 stars on Google.',
    url: PROD_BASE,
    siteName: 'Tariq Medical Centre',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg', // Add your hospital image
        width: 1200,
        height: 630,
        alt: 'Tariq Medical Centre - Hospital in Kallar Syedan',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tariq Medical Centre - Hospital in Kallar Syedan',
    description: 'Quality healthcare services in Kallar Syedan. Rated 5.0 stars on Google.',
    images: ['/og-image.jpg'], // Add your hospital image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional structured data for local business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalClinic",
              "name": "Tariq Medical Centre",
              "image": `${PROD_BASE}/og-image.jpg`,
              "description": "Hospital and medical complex in Kallar Syedan providing quality healthcare services",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Choa Road, near Bank Alfalah",
                "addressLocality": "Kallar Syedan",
                "postalCode": "46000",
                "addressCountry": "PK"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "33.5337736", // Update with actual coordinates
                "longitude": "73.6000000" // Update with actual coordinates
              },
              "url": PROD_BASE,
              "telephone": "+92-333-5337736",
              "priceRange": "$$",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "10"
              },
              "sameAs": [
                "https://www.facebook.com/tariqmedicalcentre/",
                "https://www.google.com/maps?cid=YOUR_GOOGLE_MAPS_CID"
              ]
            })
          }}
        />
      </head>
      <body>
        <Navbar/>
        <Toaster position="top-right" />
        <WhatsAppFab/>
        <main>
          <EdgeStoreProvider>{children}</EdgeStoreProvider>
        </main>
        <Footer/>
      </body>
    </html>
  );
}