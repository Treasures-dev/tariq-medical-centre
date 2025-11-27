"use client";

import React, { useState, useEffect } from "react";
import BlurText from "@/components/BlurText";

export type OrganogramProps = {
  imageSrc: string;
  altText?: string;
};

export function Organogram({ imageSrc, altText = "Our Organogram" }: OrganogramProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="w-full flex justify-center mt-6">
        <div className="relative rounded-2xl shadow-lg overflow-hidden border border-white/20 bg-white">
          <img
            src={imageSrc}
            alt={altText}
            className="max-w-full w-full object-contain block max-h-[50vh] md:max-h-[60vh]"
            loading="lazy"
          />

          {/* Zoom button */}
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setOpen(true)}
              aria-label="Zoom organogram"
              className="bg-white/90 text-teal-300 px-3 py-1 rounded-md text-xs shadow-sm hover:shadow-md"
            >
              Zoom
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Lightbox */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close zoom"
              className="absolute top-2 right-2 z-40 bg-white/90 text-[#0d3a66] rounded-full p-1 shadow"
            >
              ✕
            </button>

            <img
              src={imageSrc}
              alt={altText}
              className="w-auto max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function OurOrganogramSection() {
  const imageSrc = "/images/organogram.jpeg";

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 rounded-2xl">
      {/* Heading Section */}
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-sm  text-[#0d3a66]">
          A clear hierarchy designed for smooth operations and coordinated excellence.
        </h3>
        <div className="flex justify-center">
          <BlurText
            text="How Our System Is Organized."
            className="text-center text-2xl font-semibold tracking-tight text-[#000080] mt-2"
          />
        </div>
        <p className="mt-2 text-sm text-[#0d3a66]">
          Roles and responsibilities organized for efficiency and trust.
        </p>
      </div>

      {/* Organogram Image */}
      <div className="max-w-6xl mx-auto mt-10">
        <Organogram imageSrc={imageSrc} altText="Clinic Organogram" />
      </div>
    </section>
  );
}
