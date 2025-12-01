"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Slide = {
  id: string;
  title: string;
  body: string;
  highlights: string[];
  photo: string;
};

const SLIDES: Slide[] = [
  {
    id: "opd",
    title: "Fast & Friendly OPD Care",
    body: "Walk-ins welcome — expert physicians, quick diagnostics, and comfortable patient-first care. Book your visit or consult online.",
    highlights: ["Book Now", "Online Consultation", "Quick Diagnostics"],
    photo: "/images/doc.png",
  },
  {
    id: "lab",
    title: "Modern Diagnostics & Lab Reports",
    body: "On-site lab with fast, reliable tests. Get results online instantly and consult specialists for follow-up care without the wait.",
    highlights: ["Get Lab Tests", "Online Results", "Reliable"],
    photo: "/images/labhero.png",
  },
  {
    id: "tele",
    title: "Consult Online — From Anywhere",
    body: "Talk to our doctors remotely with secure video consultations. Save time and get professional advice from home.",
    highlights: ["Online Consultation", "Telemedicine", "Secure Video"],
    photo: "/images/girlaptop.png",
  },
];

function renderWithHighlights(text: string, highlights: string[]) {
  if (!highlights || highlights.length === 0) return text;
  let parts: Array<string | { h: string }> = [text];
  for (const h of highlights) {
    const newParts: Array<string | { h: string }> = [];
    for (const part of parts) {
      if (typeof part === "string") {
        const idx = part.toLowerCase().indexOf(h.toLowerCase());
        if (idx === -1) newParts.push(part);
        else {
          const before = part.slice(0, idx);
          const match = part.slice(idx, idx + h.length);
          const after = part.slice(idx + h.length);
          if (before) newParts.push(before);
          newParts.push({ h: match });
          if (after) newParts.push(after);
        }
      } else newParts.push(part);
    }
    parts = newParts;
  }
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <span
        key={i}
        className="rounded px-1 py-0.5 bg-[#000080] text-white font-semibold shadow-sm"
      >
        {p.h}
      </span>
    )
  );
}

export default function HeroModern() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const dots = useMemo(
    () =>
      SLIDES.map((s, i) => (
        <button
          key={s.id}
          aria-label={`Show ${s.title}`}
          onClick={() => setIndex(i)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i === index
              ? "bg-[#0d3966] scale-110"
              : "bg-white/60 hover:bg-white/80"
          }`}
        />
      )),
    [index]
  );

  return (
    <section
      aria-label="Hero — Tariq Medical Centre"
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(180deg,#e9f6ff 0%, #fbfdff 100%)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, rgba(13,57,102,0.02), transparent 25%, rgba(13,57,102,0.02) 75%)",
          mixBlendMode: "overlay",
        }}
      />

      

      <div className="relative z-10 mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
      <div className="text-left mt-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#000080] leading-tight">
            <span className="inline-block">Hospital in </span>
            <span className="inline-block rounded-lg px-3 py-1 bg-[#000080] text-white shadow-lg">
              Kallar Syedan
            </span>
          </h1>
          <p className="mt-3 text-base sm:text-lg lg:text-xl text-slate-700 font-medium">
            Providing Best Care Since{" "}
            <span className="inline-block rounded-lg px-3 py-1 bg-[#000080] text-white shadow-lg">1988</span>
          </p>
        </div>
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Vertical Navigation */}
          <div className="hidden lg:flex flex-col items-center gap-4">
            <div className="flex flex-col gap-3">
              {SLIDES.map((s, i) => {
                const active = i === index;
                return (
                  <button
                    key={s.id}
                    aria-label={`Slide ${i + 1} — ${s.title}`}
                    onClick={() => setIndex(i)}
                    className={`w-3 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      active
                        ? "bg-[#0d3966] scale-110"
                        : "bg-white/80 hover:bg-white"
                    }`}
                    style={{
                      boxShadow: active
                        ? "0 8px 20px rgba(13,57,102,0.16)"
                        : "0 4px 12px rgba(2,6,23,0.06)",
                    }}
                  >
                    <span
                      className={`block w-1.5 h-1.5 rounded-full ${
                        active ? "bg-white" : "bg-white/60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-slate-600 font-medium">
              Explore
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Text Column */}
            <div className="order-2 lg:order-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id + "-text"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-xl"
                >
                  <h3 className="text-1xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#000080] leading-[1.1]">
                    {slide.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed">
                    {renderWithHighlights(slide.body, slide.highlights)}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Photo Column */}
            <div className="order-1 lg:order-2 flex justify-center items-center">
              <div className="relative w-full max-w-[700px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id + "-photo"}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px]">
                      <Image
                        src={slide.photo}
                        alt={slide.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 700px"
                        style={{ objectFit: "contain" }}
                        priority
                        quality={100}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dots Navigation */}
        <div className="lg:hidden mt-6 flex justify-center gap-3">{dots}</div>
      </div>
    </section>
  );
}
