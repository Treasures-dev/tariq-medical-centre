// app/signin/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SuseFont } from "@/lib/utils";
import { FaGoogle, FaPhoneAlt } from "react-icons/fa";
import { authClient } from "@/lib/auth/authClient";

function Blob({ color = "#0d3a66", className = "", size = 420, opacity = 0.08 }: { color?: string; className?: string; size?: number; opacity?: number; }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 600 600"
      fill="none"
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      <path
        d="M421.5 354.5c60 93.5-1 199-102 200-101.2 1-197.8-46.5-229-129.5-31.2-83 3.2-176.6 72.5-245.5S339.5 176 380 263.5c8 17.6 7 31 41.5 91z"
        fill={color}
        filter="url(#blur)"
      />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await authClient.signIn.social({ provider: "google" });
      router.push("/");
    } catch (err: any) {
      console.error("Sign-in failed", err);
      setError(err?.message || "Sign-in failed. Try again.");
      setLoading(false);
    }
  }

  return (
    <main className={`${SuseFont.className} min-h-screen bg-linear-to-b from-white to-[#f8fafc] flex items-center justify-center py-12 px-4`}>
      <div className="relative w-full max-w-4xl">
        {/* Decorative blobs */}
        <Blob color="#0d3a66" size={520} opacity={0.06} className="absolute -left-20 -top-24 rotate-12 -z-10 hidden lg:block" />
        <Blob color="#16a34a" size={420} opacity={0.06} className="absolute -right-24 -bottom-20 rotate-6 -z-10 hidden lg:block" />

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="relative z-10 mx-auto flex flex-col items-center gap-6 rounded-2xl bg-white/90 p-8 shadow-xl ring-1 ring-black/5 md:flex-row md:items-stretch"
        >
          {/* Left / Brand */}
          <div className="flex w-full flex-col items-center gap-4 border-b border-gray-100 pb-6 md:w-1/2 md:items-start md:border-b-0 md:pr-8 md:pb-0">
            <div className="flex items-center gap-3">
              {/** optional logo image */}
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#0d3a66]/10 flex items-center justify-center">
                {/* If you have /images/logo.png, it will render; otherwise simple text icon */}
                <Image src="/images/logo.png" alt="Tariq Medical Centre" width={48} height={48} className="object-contain" />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-[#0d3a66]">Tariq Medical Centre</h1>
                <p className="mt-0.5 text-xs text-[#0d3a66]">Quality OPD & Patient Care You Can Trust</p>
              </div>
            </div>

            <p className="mt-3 max-w-sm text-sm text-[#0d3a66]">
              Sign in with Google to book appointments, view lab results, and manage your consultations.
              Staff users should be pre-registered by admin. Default role for new signups: <strong>user</strong>.
            </p>

            <div className="mt-4 flex w-full items-center justify-center md:justify-start">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-md bg-[#0d3a66] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-95 disabled:opacity-60 disabled:cursor-wait"
                aria-label="Sign in with Google"
              >
                <FaGoogle className="h-4 w-4" />
                {loading ? "Starting Google sign-in…" : "Sign in with Google"}
              </button>
            </div>

            {error && <div className="mt-3 text-xs text-red-600">{error}</div>}

            <div className="mt-4 flex items-center gap-2 text-xs text-[#0d3a66]">
              <FaPhoneAlt className="h-3 w-3" />
              <a href="tel:+92-333 5337736" className="underline">Call Reception — 24/7</a>
            </div>
          </div>

          {/* Right / Quick links & info */}
          <div className="flex w-full flex-col gap-4 py-4 md:w-1/2 md:pl-8">
            <div className="rounded-lg border border-[#0d3a66]/8 bg-[#f8fafc] p-4">
              <h3 className="text-sm font-semibold text-[#0d3a66]">Quick Actions</h3>
              <ul className="mt-2 space-y-2 text-sm text-[#0d3a66]">
                <li>• Book OPD appointments</li>
                <li>• View lab reports & imaging</li>
                <li>• Prescription renewals & teleconsult</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#0d3a66]/8 p-4">
              <h3 className="text-sm font-semibold text-[#0d3a66]">Why sign in?</h3>
              <p className="mt-2 text-sm text-[#0d3a66]">Your account stores appointment history, test results, and secure messages from clinicians. We only use Google OAuth for authentication — no passwords stored.</p>
            </div>

            <div className="mt-auto text-xs text-[#0d3a66]">
              <p>
                By signing in you agree to our <a href="/privacy" className="underline">Privacy Policy</a> &amp; <a href="/terms" className="underline">Terms</a>.
              </p>
            </div>
          </div>
        </motion.section>

        {/* footer small sign */}
        <div className="mt-6 text-center text-xs text-[#0d3a66]">
          <span>Not a patient? Staff accounts must be created by admin.</span>
        </div>
      </div>
    </main>
  );
}
