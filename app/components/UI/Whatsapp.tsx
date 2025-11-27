"use client";

import React from "react";
import { FaWhatsappSquare } from "react-icons/fa";

/**
 * WhatsApp floating button.
 * - Place <WhatsAppFab /> near root of your app (e.g. in layout) so it shows on every page.
 * - Uses wa.me link with international format (no +, no leading 0).
 */

const WA_INTL = "923335337736"; // +92 333 5337736 -> 92 333 5337736 -> 923335337736
const DISPLAY_NUMBER = "+92 333 533 7736"; // shown on UI (readable)

export default function WhatsAppFab() {
  const waLink = `https://wa.me/${WA_INTL}`;

  return (
    <div aria-hidden="false">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat on WhatsApp ${DISPLAY_NUMBER}`}
        className="
          fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50
          flex items-center gap-3
          bg-[#25D366] text-white
          px-3 py-2 rounded-full shadow-xl
          hover:scale-105 transform transition
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]
          select-none
        "
      >
        <FaWhatsappSquare className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
        <span className="hidden sm:inline-block text-xs md:text-sm font-medium select-none">
          {DISPLAY_NUMBER}
        </span>
      </a>
    </div>
  );
}
