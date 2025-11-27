// components/UI/ServiceDetailClient.tsx
"use client";

import React from "react";
import useSWR from "swr";
import { Clock, DollarSign, Info, CreditCard } from "lucide-react";
import Link from "next/link";

type RawService = Record<string, any>;
type Service = {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  price?: number;
  durationMinutes?: number;
  installmentAvailable?: boolean;
  raw?: RawService;
};

const THEME = "#0d3a66";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ServiceDetailClient({ initialData }: { initialData?: RawService | Service }) {
  const slug =
    (initialData as any)?.slug ??
    (initialData as any)?._id ??
    (initialData as any)?.id ??
    undefined;
  const apiPath = slug ? `/api/services/${slug}` : `/api/services`;

  const { data, error } = useSWR(apiPath, fetcher, {
    fallbackData: initialData ? (Array.isArray(initialData) ? { services: initialData } : initialData) : undefined,
    revalidateOnFocus: true,
  });

  const svcRaw: any = data?.service ?? data ?? initialData ?? {};
  const id = svcRaw._id?.$oid ?? svcRaw._id ?? svcRaw.id ?? String(Math.random());
  const title = svcRaw.title ?? svcRaw.name ?? "Service";
  const description = svcRaw.description ?? svcRaw.summary ?? "";
  const image = svcRaw.image ?? svcRaw.photo ?? "/images/service-placeholder.jpg";
  const price = typeof svcRaw.price === "number" ? svcRaw.price : (svcRaw.price ? Number(svcRaw.price) : undefined);
  const durationMinutes = svcRaw.durationMinutes ?? svcRaw.duration ?? undefined;
  const installmentAvailable = Boolean(svcRaw.installmentAvailable || svcRaw.installmentOptions);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">Failed to load service details.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Minimal header - logo top-left */}
      <header className="w-full flex mt-20 items-center justify-start py-4 px-2 mb-4">
        <Link href="/" aria-label="Home">
          <img
            src="/images/logo.png"
            alt="Tariq Medical Centre"
            className="w-12 h-12 object-contain rounded-md shadow-sm bg-white"
          />
        </Link>
      </header>

      <article className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Responsive layout: image left (narrow) + content right */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start p-6">
          {/* Image column */}
          <div className="flex items-start justify-center">
            <div className="w-full md:w-48">
              <img
                src={image}
                alt={title}
                className="w-full h-44 md:h-48 object-cover rounded-lg shadow-sm"
              />
              {svcRaw.onOffer && (
                <div className="mt-3 inline-block bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  Offer
                </div>
              )}
            </div>
          </div>

          {/* Content column */}
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: THEME }}>
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
              {typeof price === "number" && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">PKR {price.toLocaleString()}</span>
                </div>
              )}

              {durationMinutes && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                  <Clock className="w-4 h-4" />
                  <span>{durationMinutes} min</span>
                </div>
              )}

              {installmentAvailable && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded text-green-700">
                  <CreditCard className="w-4 h-4" />
                  <span>Installments Available</span>
                </div>
              )}
            </div>

            <div className="prose max-w-none text-gray-700 mb-6">
              {typeof description === "string" && description.includes("<") ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p>{description || "No detailed description available for this service yet."}</p>
              )}
            </div>

            {/* actions */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d3a66] text-white rounded-lg hover:opacity-95">
                Book Now
              </Link>

              <a href={`/contact`} className="text-sm text-[#0d3a66] underline">Contact & Appointments</a>

              <button
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(location.href);
                    // small non-intrusive feedback
                    const el = document.createElement("div");
                    el.textContent = "Link copied";
                    el.className = "fixed bottom-5 right-5 bg-black text-white px-3 py-2 rounded";
                    document.body.appendChild(el);
                    setTimeout(() => document.body.removeChild(el), 1200);
                  } catch {
                    prompt("Copy this URL", location.href);
                  }
                }}
                className="ml-auto text-sm text-gray-500 flex items-center gap-2"
                aria-label="Copy link"
              >
                <Info className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
