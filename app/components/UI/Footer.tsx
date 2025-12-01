"use client";

import React, { JSX, useEffect } from "react";
import BlurText from "@/components/BlurText";
import useSWR from "swr";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import Link from "next/link";

type Department = {
  _id: string;
  name: string;
  slug: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Footer(): JSX.Element {
  const { data, error } = useSWR("/api/departments", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
    fallbackData: { data: [] },
  });

  // Normalize shapes
  const departments: Department[] = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Department[];
    if (Array.isArray((data as any).departments))
      return (data as any).departments;
    return [];
  }, [data]);

  const isLoading = data === undefined && !error;

  return (
    <footer className="bg-white/90 backdrop-blur-md border-t border-white/20 shadow-inner mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Section */}
        <div>
          <h4 className="text-[#0d3966] font-semibold mb-2">About Us</h4>
          <BlurText
            text="Tariq Medical Centre"
            className="text-2xl font-semibold text-[#000080] mb-2"
          />
          <p className="text-sm text-[#0d3a66]">
            Providing quality healthcare with compassion, professionalism, and
            care.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[#0d3966] font-semibold mb-2">Quick Links</h4>
          <ul className="text-sm text-[#0d3a66] space-y-1">
            <li>
              <Link href="/" className="hover:text-[#0d3966]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/doctors" className="hover:text-[#0d3966]">
                Doctors
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#0d3966]">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-[#0d3966]">
                Services
              </Link>
            </li>

            {/* NEW BUTTON */}
            <li className="pt-3">
              <Link
                href="/join-team"
                className="inline-block bg-[#0d3966] text-white px-3 py-2 rounded-md hover:bg-[#124a88] transition"
              >
                Join Our Team
              </Link>
            </li>
          </ul>
        </div>

        {/* Departments */}
        <div>
          {isLoading ? (
            <div aria-busy="true" aria-live="polite">
              <h4 className="text-[#0d3966] font-semibold mb-2">Departments</h4>
              <ul className="text-sm text-[#0d3a66] space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-3 w-24 bg-white/40 rounded animate-pulse"
                  />
                ))}
              </ul>
            </div>
          ) : departments.length > 0 ? (
            <div>
              <h4 className="text-[#0d3966] font-semibold mb-2">Departments</h4>
              <ul className="text-sm text-[#0d3a66] space-y-1">
                {departments.slice(0, 6).map((dept) => (
                  <li key={dept._id}>
                    <Link
                      href={`/departments/${dept.slug}`}
                      className="hover:text-[#0d3966]"
                    >
                      {dept.name}
                    </Link>
                  </li>
                ))}

                {/* ---- Static Items ---- */}
                <li>
                  <Link
                    href="https://dentifitdentistry.com"
                    target="_blank"
                    className="hover:text-[#0d3966]"
                  >
                    Dentifit Dentistry
                  </Link>
                </li>

                <li>
                  <Link
                    href="https://dentifitdentistry.com"
                    target="_blank"
                    className="hover:text-[#0d3966]"
                  >
                    Uyoon Dentistry
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <h4 className="text-[#0d3966] font-semibold mb-2">Departments</h4>
              <Link
                href="/departments"
                className="text-sm text-[#0d3a66] hover:text-[#0d3966]"
              >
                View all departments
              </Link>
            </div>
          )}
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="text-[#0d3966] font-semibold mb-2">Contact Us</h4>
          <p className="text-sm text-[#0d3a66]">
            Phone:{" "}
            <a href="tel:0333-5337736" className="hover:text-[#0d3966]">
              0333-5337736
            </a>
            <span> , </span>
            <a href="tel:051-3570060" className="hover:text-[#0d3966]">
              051-3570060
            </a>
          </p>
          <p className="text-sm text-[#0d3a66] mt-1">
            AA Plaza, Choa Road, Kallar Syedan
          </p>

          <div className="mt-4 flex gap-4">
            <a
              href="https://www.instagram.com/explore/locations/659196804167364/tariq-medical-centre-kallar-syedan-previously-tariq-nursing-home/"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0d3966] hover:text-[#2563eb]"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@tariq.medical.cen?_r=1&_t=ZS-91meVhpVQP7"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0d3966] hover:text-[#2563eb]"
            >
              <FaTiktok className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/tariqmedicalcentre/"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0d3966] hover:text-[#2563eb]"
            >
              <FaFacebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 text-center py-4 text-xs text-[#475569]">
        &copy; {new Date().getFullYear()} Tariq Medical Centre. All rights
        reserved.
      </div>
    </footer>
  );
}
