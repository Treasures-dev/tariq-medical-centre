"use client";

import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaStar,
  FaGlobe,
  FaDirections,
  FaRegCommentDots,
  FaSave,
  FaShareAlt,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";

const THEME = "#0d3a66";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const address = "Choa Road, near Bank Alfalah, Kallar Syedan, 46000";
  const phone = "03335337736";
  const website = "https://tariqmedicalcentre.example"; // replace with real website
  const googleShort = "https://share.google/zBZbUaVNUsrQKUJIS"; // replace if needed
  const instagram = "https://www.instagram.com/tariqmedicalcentre_kalarsyedan/";
  const facebook = "https://www.facebook.com/tariqmedicalcentre";
  const mapsQuery = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const reviewsUrl = googleShort; // if you have a dedicated reviews page update this

  function handleCall() {
    // Click-to-call (mobile & desktop with softphone)
    window.location.href = `tel:${phone}`;
  }

  async function handleShare() {
    const shareData = {
      title: "Tariq Medical Centre, Kallar Syedan",
      text: `Tariq Medical Centre — ${address} — Phone: ${phone}`,
      url: googleShort || website,
    };

    if ((navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
        setShareMsg("Shared");
        setTimeout(() => setShareMsg(null), 1500);
        return;
      } catch {
        // user cancelled or failed — fallback below
      }
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setShareMsg("Link copied");
      setTimeout(() => {
        setCopied(false);
        setShareMsg(null);
      }, 2000);
    } catch {
      setShareMsg("Unable to copy");
      setTimeout(() => setShareMsg(null), 1500);
    }
  }

  async function handleSaveContact() {
    try {
      const text = `${address} — ${phone} — ${website}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-12">
      {/* Minimal header — logo top-left */}
      <header className="max-w-5xl mt-20 mx-auto mb-6">
        <div className="flex items-center gap-3">
          <a href="/" aria-label="Home" className="inline-flex items-center">
            <img
              src="/images/logo.png"
              alt="Tariq Medical Centre"
              className="w-12 h-12 object-contain rounded-md shadow-sm bg-white p-1"
            />
          </a>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: THEME }}>
              Tariq Medical Centre
            </h2>
            <p className="text-sm text-gray-600">Kallar Syedan — Open 24 hours</p>
          </div>
        </div>
      </header>

      {/* Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 items-start">
          {/* Left column: contact info */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-[#f0f6ff] flex items-center justify-center text-[#0d3a66]">
                <FaMapMarkerAlt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Address</h3>
                <p className="text-sm text-gray-600 mt-1">{address}</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={mapsQuery}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#0d3a66] text-white text-sm font-medium hover:opacity-95"
                    aria-label="Get directions"
                  >
                    <FaDirections /> Directions
                  </a>

                  <a
                    href={googleShort}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:shadow-sm"
                    aria-label="Open website"
                  >
                    <FaGlobe /> Website
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-[#f0f6ff] flex items-center justify-center text-[#0d3a66]">
                <FaPhoneAlt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Phone</h3>
                <p className="text-sm text-gray-600 mt-1">{phone}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleCall}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#0d3a66] text-white text-sm font-medium hover:opacity-95"
                    aria-label={`Call ${phone}`}
                  >
                    <FaPhoneAlt /> Call
                  </button>

                  <a
                    href={`sms:${phone}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:shadow-sm"
                    aria-label="Send SMS"
                  >
                    <FaRegCommentDots /> SMS
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-[#f0f6ff] flex items-center justify-center text-[#0d3a66]">
                <FaClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Hours</h3>
                <p className="text-sm text-gray-600 mt-1">Open 24 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#0d3a66] text-white text-sm font-semibold shadow">
                <FaStar className="text-yellow-300" />
                <span>5.0</span>
                <span className="text-white/80 text-xs">Google reviews</span>
              </div>

              <a
                href={reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#0d3a66] underline"
              >
                Read reviews
              </a>
            </div>
          </div>

          {/* Right column: actions grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick actions</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm"
                aria-label="Open website"
              >
                <FaGlobe className="w-5 h-5 text-[#0d3a66]" />
                <span className="text-xs font-medium">Website</span>
              </a>

              <a
                href={mapsQuery}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm"
                aria-label="Get directions"
              >
                <FaDirections className="w-5 h-5 text-[#0d3a66]" />
                <span className="text-xs font-medium">Directions</span>
              </a>

              <a
                href={reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm"
                aria-label="Read reviews"
              >
                <FaRegCommentDots className="w-5 h-5 text-[#0d3a66]" />
                <span className="text-xs font-medium">Reviews</span>
              </a>

              <button
                onClick={handleSaveContact}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm"
                aria-label="Save contact"
              >
                <FaSave className="w-5 h-5 text-[#0d3a66]" />
                <span className="text-xs font-medium">Save</span>
              </button>

              <button
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm"
                aria-label="Share"
              >
                <FaShareAlt className="w-5 h-5 text-[#0d3a66]" />
                <span className="text-xs font-medium">Share</span>
              </button>

              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5 text-pink-500" />
                <span className="text-xs font-medium">Instagram</span>
              </a>

              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm col-span-2"
                aria-label="Facebook"
              >
                <FaFacebook className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium">Facebook</span>
              </a>
            </div>

            {/* small helper: copy status */}
            {shareMsg && (
              <div className="mt-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md inline-block">
                {shareMsg}
              </div>
            )}

            {copied && !shareMsg && (
              <div className="mt-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md inline-block">
                Saved to clipboard
              </div>
            )}

            {/* small footer */}
            <div className="mt-6 text-xs text-gray-500">
              Links: website, directions (maps), reviews, Instagram, Facebook. Tap Share to copy link or use device share.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
