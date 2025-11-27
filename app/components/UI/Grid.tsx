"use client";

import React from "react";
import {
  Activity,
  Calendar,
  Users,
  ShoppingCart,
  Video,
  Star,
} from "lucide-react";
import BlurText from "@/components/BlurText";

export default function ServiceSection() {
  return (
    <>
      <div className="mx-auto max-w-2xl mt-20 text-center">
        <h3 className="text-base font-semibold text-[#0d3a66]">
          Your wellbeing — our everyday promise.
        </h3>
        <div className="flex justify-center">
          <BlurText
            text="Care that revolves around you"
            className="text-center text-3xl font-semibold tracking-tight text-[#000080]"
          />
        </div>
        <p className="mt-2 text-sm text-[#0d3a66]">
          Small acts of care, big improvements in health — every step of the
          way.
        </p>
      </div>

      <section className="relative py-12 px-4 sm:px-6 lg:px-12 overflow-hidden rounded-2xl">
        {/* decorative background blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-20 -left-20 w-[420px] h-[420px] bg-gradient-to-br from-[#e0f2ff] to-[#f0f9ff] opacity-40 blur-3xl rounded-full transform rotate-12" />
          <div className="absolute -bottom-20 -right-10 w-[360px] h-[360px] bg-gradient-to-br from-[#fff0f6] to-[#fff7ed] opacity-30 blur-3xl rounded-full transform -rotate-6" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[220px] bg-gradient-to-r from-[#e6f7ff]/20 to-[#f3f8ff]/5 opacity-40 blur-xl rounded-3xl" />
        </div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center md:gap-10 lg:gap-48 sm:gap-10 relative z-10">
          {/* Left side: headline + text + perks */}
          <div className="lg:w-1/2 flex flex-col justify-center text-left">
            <h3 className="text-sm sm:text-base font-semibold text-[#0d3a66] mb-2">
              Quality Healthcare, Every Step
            </h3>
            <BlurText
              text="Perks of choosing Us."
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#000080] mb-4"
            />
            <p className="text-xs sm:text-sm text-[#0d3a66] mb-4">
              Access top doctors, pharmacy, lab reports, and more in one place.
              We combine convenience, professionalism, and technology to provide
              a seamless healthcare experience.
            </p>
            <ul className="space-y-2 text-sm text-[#0d3a66] mb-4">
              <li className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Expert medical
                staff with years of experience
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Fast and secure
                online lab reports
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Easy and quick
                appointment booking
              </li>
              <li className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" /> Home pharmacy
                delivery within hours
              </li>
              <li className="flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" /> Online consultations
                with e-prescriptions
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" /> Trusted by thousands
                of patients nationwide
              </li>
            </ul>
            <p className="text-xs sm:text-sm text-[#0d3a66]">
              Join us to experience quality healthcare, personalized care, and
              peace of mind for you and your family.
            </p>
          </div>

          {/* Right side: collage */}
          <div className="lg:w-1/2 flex justify-center items-center mt-8 lg:mt-0">
            <div className="relative w-full max-w-[520px] flex items-center justify-center">
              {/* Left small image (hidden on small screens) */}
              <div className="hidden md:block absolute -left-6 top-12 transform -rotate-12 z-10">
                <div className="w-36 h-48 md:w-40 md:h-56 overflow-hidden rounded-[50%/40%] border-4 border-[#7dd3fc] shadow-lg transform transition-transform duration-500 hover:scale-105 hover:-rotate-6">
                  <img
                    src="/images/bento1.png"
                    alt="Care illustration left"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Center main image */}
              <div className="relative z-30">
                <div className="w-[220px] h-[300px] sm:w-[260px] sm:h-[360px] md:w-[300px] md:h-[420px] overflow-hidden rounded-[48%/40%] border-8 border-[#ffd580] shadow-2xl transform rotate-2 transition-transform duration-500 hover:scale-105 hover:rotate-0">
                  <img
                    src="/images/aidoctor.png"
                    alt="Main service"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right small image (hidden on small screens) */}
              <div className="hidden md:block absolute -right-6 top-16 transform rotate-12 z-20">
                <div className="w-36 h-48 md:w-40 md:h-56 overflow-hidden rounded-[50%/40%] border-4 border-[#fca5a5] shadow-lg transform transition-transform duration-500 hover:scale-105 hover:rotate-6">
                  <img
                    src="/images/sec-1.png"
                    alt="Care illustration right"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Tablet view: show two images side-by-side */}
              <div className="md:hidden sm:flex sm:gap-4 sm:items-center sm:justify-center absolute inset-0 z-40 pointer-events-none">
                {/* single centered for smallest screens handled by center image; this block acts on small screens if needed */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
