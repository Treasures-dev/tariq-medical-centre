// app/components/ServiceCarousel.tsx
"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import BlurText from "@/components/BlurText";

type Service = {
  _id?: any;
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  installmentAvailable?: boolean;
  onOffer?: boolean;
  offerPrice?: number;
  image?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ServiceCarousel() {
  const { data, error } = useSWR("/api/services", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 5000,
  });

  const services: Service[] = Array.isArray(data?.data ?? data?.services ?? data)
    ? data?.data ?? data?.services ?? data
    : [];

  const [index, setIndex] = useState(0);

  // Auto-rotate
  useEffect(() => {
    if (!services.length) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % services.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [services]);

  if (error)
    return <div className="text-center py-8 text-red-500">Failed to load services.</div>;
  if (!data)
    return <div className="text-center py-8">Loading services...</div>;
  if (!services.length)
    return <div className="text-center py-8">No services available.</div>;

  const svc = services[index];

  const priceLabel =
    svc.onOffer && typeof svc.offerPrice === "number"
      ? `PKR ${svc.offerPrice} (Offer)`
      : typeof svc.price === "number"
      ? `PKR ${svc.price}`
      : null;

  const durationLabel = svc.durationMinutes ? `${svc.durationMinutes} min` : null;

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-[#0d3a66]">We offer a variety of services</p>
          <div className="flex justify-center">
          <BlurText 
          text="Our Services & Treatments"
          className="mt-2 text-3xl tracking-tight md:text-3xl font-semibold text-[#000080]"/>
           
          </div>
         
          
          <p className="mt-2 text-sm text-[#0d3a66] max-w-2xl mx-auto">
            Explore our range of healthcare services tailored for you.
          </p>
        </div>

        {/* Split Section Carousel */}
        <div className="relative flex flex-col md:flex-row items-center gap-8 bg-white overflow-hidden p-6 md:p-8">
          {/* Left: Image */}
          <div className="md:w-1/2 shrink-0">
            <img
              src={svc.image ?? "/images/images1.png"}
              alt={svc.title}
              className="w-full h-64 md:h-80 object-cover rounded-[50px] border-4 border-cyan-100 shadow-sm transition-transform duration-500"
            />
          </div>

          {/* Right: Details */}
          <div className="md:w-1/2 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold text-[#0d3a66]">{svc.title}</h3>
              <p className="mt-2 text-sm text-[#475569]">{svc.description || "No description available."}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {priceLabel && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{priceLabel}</span>}
                {durationLabel && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{durationLabel}</span>}
                {svc.installmentAvailable && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Installments</span>}
                {svc.onOffer && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">On Offer</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                href={svc.slug ? `/services/${svc.slug}` : "#"}
                className="px-4 py-2 rounded-md bg-[#0d3a66] text-white text-sm font-medium hover:bg-[#0b3150] transition"
              >
                View Details
              </Link>
              <Link
                href="/appointments"
                className="px-4 py-2 rounded-md border border-[#0d3a66] text-[#0d3a66] text-sm font-medium hover:bg-[#0d3a66] hover:text-white transition"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="absolute top-1/2 left-4 md:left-6 transform -translate-y-1/2">
            <button
              onClick={() => setIndex((i) => (i - 1 + services.length) % services.length)}
              className="p-2 text-white rounded-full bg-[#0d3a66] shadow-md hover:bg-[#0d3a66] transition"
              aria-label="Previous"
            >
              ‹
            </button>
          </div>
          <div className="absolute top-1/2 right-4 md:right-6 transform -translate-y-1/2">
            <button
              onClick={() => setIndex((i) => (i + 1) % services.length)}
              className="p-2 text-white rounded-full bg-[#0d3a66] shadow-md hover:bg-[#0d3a66] transition"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="mt-6 flex justify-center items-center gap-2">
          {services.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? "bg-[#0d3a66] w-4" : "bg-gray-300"}`}
              aria-label={`Go to service ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
