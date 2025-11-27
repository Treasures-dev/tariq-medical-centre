"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SuseFont } from "@/lib/utils";
import { FaGoogle, FaPhoneAlt } from "react-icons/fa";
import { authClient } from "@/lib/auth/authClient";

function Blob({
  color = "#0d3a66",
  className = "",
  size = 420,
  opacity = 0.08,
}: {
  color?: string;
  className?: string;
  size?: number;
  opacity?: number;
}) {
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

  const {
    data: session,
    isPending, //loading state
    refetch, //refetch the session
  } = authClient.useSession();

  useEffect(() => {
    if (session?.user) router.push("/");
  }, [session, router]);

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
    <main
      className={`${SuseFont.className} min-h-screen bg-linear-to-b from-white to-[#f8fafc] flex items-center justify-center py-12 px-4`}
      aria-labelledby="signin-heading"
    >
      <div className="relative w-full mt-20 max-w-5xl">
        {/* Background blobs for subtle texture */}
        <Blob
          color="#0d3a66"
          size={560}
          opacity={0.06}
          className="absolute -left-24 -top-28 rotate-12 -z-10 hidden lg:block"
        />
        <Blob
          color="#16a34a"
          size={420}
          opacity={0.06}
          className="absolute -right-28 -bottom-24 rotate-6 -z-10 hidden lg:block"
        />

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="relative z-10 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch rounded-2xl bg-white/95 p-6 shadow-2xl ring-1 ring-black/5"
        >
          {/* Left - Branding + CTA */}
          <div className="flex flex-col gap-4 px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#0d3a66]/10 flex items-center justify-center ring-1 ring-[#0d3a66]/6">
                <Image
                  src="/images/logo.png"
                  alt="Tariq Medical Centre"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>

              <div>
                <h1
                  id="signin-heading"
                  className="text-xl font-semibold text-[#0d3a66]"
                >
                  Tariq Medical Centre
                </h1>
                <p className="mt-0.5 text-xs text-[#0d3a66]">
                  Quality OPD & Patient Care You Can Trust
                </p>
              </div>
            </div>

            <p className="mt-2 max-w-md text-sm text-[#0d3a66]">
              Sign in with Google to securely manage appointments, view lab
              results, and message your clinicians. Staff accounts are created
              by the admin — patients can self-register using Google OAuth.
            </p>

            <div className="mt-4 flex w-full items-center justify-center md:justify-start">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-lg bg-[#0d3a66] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d3a66]/30 disabled:opacity-60 disabled:cursor-wait"
                aria-label="Sign in with Google"
              >
                <FaGoogle className="h-4 w-4" aria-hidden />
                <span className="truncate">
                  {loading ? "Starting Google sign-in…" : "Sign in with Google"}
                </span>
              </button>
            </div>

            {error && (
              <div className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-sm text-[#0d3a66]">
              <FaPhoneAlt className="h-4 w-4" aria-hidden />
              <a href="tel:+923335337736" className="underline">
                Call Reception — +92 333 533 7736
              </a>
            </div>

            <div className="mt-3 text-xs text-gray-600 max-w-md">
              <strong>Data we collect:</strong>
              <ul className="mt-2 list-disc pl-5">
                <li>
                  Basic profile info from Google (name, email, profile picture)
                  used to create your account.
                </li>
                <li>
                  Phone number when you provide it for appointment reminders.
                </li>
                <li>
                  Medical records (appointments, test results, prescriptions)
                  you share with clinicians — stored securely.
                </li>
              </ul>
            </div>

            <div className="mt-3 text-xs text-[#0d3a66]">
              <p>
                We only collect the minimum information required to provide
                appointment services and clinical care. Your data is stored
                securely, encrypted at rest, and accessed only by authorized
                staff. We never sell your data. See our{" "}
                <a href="/privacy" className="underline">
                  Privacy Policy
                </a>{" "}
                for full details.
              </p>
            </div>
          </div>

          {/* Right - Quick links, benefits & trust */}
          <div className="flex flex-col gap-4 rounded-lg border border-[#0d3a66]/8 bg-[#f8fafc] p-6">
            <div>
              <h3 className="text-sm font-semibold text-[#0d3a66]">
                Quick Actions
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#0d3a66]">
                <li>• Book OPD appointments — choose date, time & doctor</li>
                <li>• View secure lab reports & imaging</li>
                <li>• Prescription renewals & teleconsultations</li>
              </ul>
            </div>

            <div className="rounded-md border border-[#0d3a66]/8 bg-white p-4">
              <h4 className="text-sm font-semibold text-[#0d3a66]">
                Why sign in?
              </h4>
              <p className="mt-2 text-sm text-[#0d3a66]">
                Your account stores appointment history, test results, and
                messages from clinicians. We use Google OAuth for authentication
                — no passwords are stored on our servers.
              </p>
            </div>

            <div className="mt-auto text-xs text-[#0d3a66]">
              <p>
                By signing in you agree to our{" "}
                <a href="/privacy" className="underline">
                  Privacy Policy
                </a>{" "}
                &amp;{" "}
                <a href="/terms" className="underline">
                  Terms of Service
                </a>
                .
              </p>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              <p>
                <strong>Security:</strong> Data is encrypted in transit (TLS)
                and at rest. Access is role-based and audited regularly.
              </p>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 text-center text-xs text-[#0d3a66]">
          <span>
            Not a patient? Staff accounts must be created by an administrator.
          </span>
        </div>
      </div>
    </main>
  );
}
