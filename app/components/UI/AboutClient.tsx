// components/UI/AboutClient.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  FaHeartbeat,
  FaUsers,
  FaHandsHelping,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaAmbulance,
  FaVial,
  FaStethoscope,
} from "react-icons/fa";

const THEME = "#0d3a66";

export default function AboutClient() {
  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-12">
      {/* Minimal header - logo left */}
      <header className="max-w-6xl mt-20 mb-6 mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <img
              src="/images/logo.png"
              alt="Tariq Medical Centre"
              className="w-12 h-12 object-contain rounded-md shadow-sm bg-white p-1"
            />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: THEME }}>
              About Tariq Medical Centre
            </h1>
            <p className="text-sm text-gray-600">
              Compassionate care for Kallar Syedan & surrounding communities
            </p>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: intro + CTAs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold" style={{ color: THEME }}>
              Who we are
            </h2>
            <p className="mt-3 text-gray-700 text-sm">
              Tariq Medical Centre is a community-centered medical facility in
              Kallar Syedan delivering outpatient, inpatient and emergency
              services. We combine modern equipment with a compassionate team.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0d3a66] text-white text-sm font-semibold"
              >
                <FaPhoneAlt /> Contact
              </a>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold"
              >
                <FaHeartbeat /> Services
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Quick Facts</h3>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#eef5ff] text-[#0d3a66]">
                  <FaUsers />
                </span>
                <div>
                  <div className="font-semibold">Team</div>
                  <div className="text-gray-600 text-xs">
                    Experienced doctors, nurses & support staff
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#eef5ff] text-[#0d3a66]">
                  <FaHandsHelping />
                </span>
                <div>
                  <div className="font-semibold">Community</div>
                  <div className="text-gray-600 text-xs">
                    Local outreach & health awareness programs
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#eef5ff] text-[#0d3a66]">
                  <FaMapMarkerAlt />
                </span>
                <div>
                  <div className="font-semibold">Location</div>
                  <div className="text-gray-600 text-xs">
                    Choa Road, near Bank Alfalah, Kallar Syedan
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle: Mission / Vision / Values (primary content) */}
        <div className="lg:col-span-1 space-y-6">
          <article className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold" style={{ color: THEME }}>
              Our Mission
            </h2>
            <p className="mt-3 text-gray-700 text-sm">
              To provide accessible, high-quality healthcare with compassion and
              professionalism — putting patients first in every decision.
            </p>
          </article>

          <article className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold" style={{ color: THEME }}>
              Our Vision
            </h2>
            <p className="mt-3 text-gray-700 text-sm">
              To be the trusted healthcare partner in our region — recognized
              for clinical excellence, continuous learning and community
              service.
            </p>
          </article>

          <article className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold" style={{ color: THEME }}>
              Core Values
            </h2>
            <ul className="mt-3 text-sm text-gray-700 space-y-2">
              <li>
                <strong>Compassion:</strong> We treat every person with empathy
                and dignity.
              </li>
              <li>
                <strong>Quality:</strong> Evidence-based care and continuous
                improvement.
              </li>
              <li>
                <strong>Integrity:</strong> Transparent and ethical practice.
              </li>
            </ul>
          </article>
        </div>

        {/* Right: History + Team preview */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Our Story</h3>
            <p className="mt-3 text-gray-700 text-sm">
              Founded to serve Kallar Syedan with reliable medical care, Tariq
              Medical Centre has expanded services while keeping community needs
              at the heart of everything we do.
            </p>
            <p className="mt-3 text-gray-500 text-xs">
              Established 1988 — continuously serving thousands of patients each
              year.
            </p>
          </div>

          {/* compact feature cards with 5+ reviews badge */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0d3a66]">
              Our Services — Trusted by Patients
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 – Consultation */}
              <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-gray-100 shadow-sm hover:shadow transition-all">
                <div className="w-12 h-12 rounded-lg bg-[#e8f0ff] flex items-center justify-center text-[#0d3a66] text-xl">
                  <FaStethoscope />
                </div>

                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    General Consultation
                  </div>
                  <div className="text-xs text-gray-500">
                    Outpatient & follow-up care
                  </div>
                </div>

               
              </div>

              {/* Card 2 – Lab / Pathology */}
              <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-gray-100 shadow-sm hover:shadow transition-all">
                <div className="w-12 h-12 rounded-lg bg-[#e8f0ff] flex items-center justify-center text-[#0d3a66] text-xl">
                  <FaVial />
                </div>

                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    Pathology & Lab
                  </div>
                  <div className="text-xs text-gray-500">
                    Accurate testing, fast reports
                  </div>
                </div>

             
              </div>

              {/* Card 3 – Emergency (full width on small screens) */}
              <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-gray-100 shadow-sm hover:shadow transition-all sm:col-span-2">
                <div className="w-12 h-12 rounded-lg bg-[#e8f0ff] flex items-center justify-center text-[#0d3a66] text-xl">
                  <FaAmbulance />
                </div>

                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    24/7 Emergency Care
                  </div>
                  <div className="text-xs text-gray-500">
                    Immediate response & stabilization
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold hover:shadow-sm"
              >
                View all services
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {/* Full-width mission banner */}
      <section className="max-w-6xl mx-auto mt-10">
        <div className="bg-[#0d3a66] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Need care now?</h3>
            <p className="text-sm opacity-90 mt-1">
              We are open 24 hours — walk-ins and emergency services available.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#0d3a66] font-semibold"
            >
              Contact
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-white/20 text-white font-semibold"
            >
              Our Services
            </a>
          </div>
        </div>
      </section>

      {/* Footer small credits */}
      <footer className="max-w-6xl mx-auto mt-10 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Tariq Medical Centre — Caring for our
        community.
      </footer>
    </main>
  );
}
