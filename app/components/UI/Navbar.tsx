"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { authClient } from "@/lib/auth/authClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  topOffset?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Navbar({ topOffset = "6" }: Props) {
  const isTailwindOffset = /^\d+$/.test(topOffset);
  const { data: departmentsData } = useSWR("/api/departments", fetcher);
  const departments = departmentsData?.departments ?? departmentsData ?? [];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  // user menu + logout modal state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // close menu on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // logout flow
  const confirmLogout = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully!");
            try {
              router.push("/"); // client-side redirect to home
            } catch (e) {
              window.location.href = "/";
            }
          },
          onError: (_err: any) => {
            toast.error("Logout failed");
          },
        },
      });
    } catch (err) {
      toast.error("Logout failed");
    } finally {
      setSigningOut(false);
      setConfirmOpen(false);
      setUserMenuOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] mt-3 sm:mt-5 max-w-7xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 bg-white/40 backdrop-blur-md border border-white/20 shadow-lg"
        style={{
          top: isTailwindOffset ? undefined : topOffset,
          WebkitBackdropFilter: "blur(8px)",
          backdropFilter: "blur(8px)",
          ...(isTailwindOffset ? {} : { top: topOffset }),
        }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-extrabold text-white text-sm sm:text-base"
              style={{ background: "#fff" }}
            >
              <img
                src="/images/logo.png"
                alt="tmc-logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-[#0d3966]">
                Tariq Medical Centre
              </div>
              <div className="text-xs text-[#0d3a66]">
                OPD • Emergency • Diagnostics
              </div>
            </div>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8 text-[#0d3a66] font-medium">
            <Link href="/" className="hover:text-[#0d3966] transition-colors">
              Home
            </Link>

            {/* Departments Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDepartmentsOpen(true)}
              onMouseLeave={() => setDepartmentsOpen(false)}
            >
              <button className="hover:text-[#0d3966] transition-colors flex items-center gap-1">
                Departments
                <svg
                  className={`w-4 h-4 transition-transform ${
                    departmentsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {departmentsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {departments.map((dept: any, index: number) => (
                        <motion.a
                          key={dept._id?.$oid || dept._id}
                          href={`departments/${dept.slug}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#0d3966]/5 transition-all"
                        >
                          <img
                            className="h-8 w-8 rounded-[5px] object-cover"
                            src={dept.photo ?? "/images/placeholder.jpg"}
                            alt={dept.name}
                          />

                          <div className="flex-1">
                            <div className="text-sm font-semibold text-[#0d3966] group-hover:text-[#1e5a8e] transition-colors">
                              {dept.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dept.description || "Specialized care"}
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-[#0d3966] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </motion.a>
                      ))}
                    </div>
                    <div className="mt-2 mb-5 px-4">
                      <Link
                        href="/departments"
                        className="text-sm font-medium text-[#0d3966] hover:underline"
                      >
                        View all departments!
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/doctors"
              className="hover:text-[#0d3966] transition-colors"
            >
              Doctors
            </Link>
            <Link
              href="/about"
              className="hover:text-[#0d3966] transition-colors"
            >
              About
            </Link>
            <Link
              href="#"
              className="hover:text-[#0d3966] transition-colors"
            >
              Lab
            </Link>
            <Link
              href="/#"
              className="hover:text-[#0d3966] transition-colors"
            >
              Pharmacy
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#0d3966] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right side: user avatar/login + Book Now + mobile menu */}
          <div className="flex items-center gap-3">
            {/* avatar & user menu (desktop) */}
            <div className="relative" ref={userMenuRef}>
              {session?.user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen((s) => !s)}
                    className="flex items-center gap-2 rounded-full hover:bg-white/60 px-2 py-1 transition"
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="h-9 w-9 rounded-full object-cover border border-white/20 shadow-sm"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-linear-to-br from-[#0d3a66] to-[#1e5a8e] flex items-center justify-center text-white font-semibold">
                        {session.user?.name?.[0] ?? "A"}
                      </div>
                    )}
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-sm font-semibold text-[#0d3a66]">
                        {session.user?.name ?? "Account"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {session.user?.email ?? ""}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-white/20 overflow-hidden z-50"
                      >
                        <div className="p-3">
                          <div className="text-sm font-medium text-[#0d3a66]">
                            {session.user?.name ?? "User"}
                          </div>
                          <div className="text-xs text-gray-500 wrap-break-word">
                            {session.user?.email}
                          </div>
                        </div>
                        <div className="border-t" />
                        <button
                          onClick={() => setConfirmOpen(true)}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          Log out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                // NO USER: show Login CTA
                <button
                  onClick={() => router.push("/auth")}
                  className="flex items-center gap-2 rounded-full bg-[#0d3966] text-white px-3 py-1.5 hover:opacity-95 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12H3m12 0l-4-4m4 4l-4 4M21 12v6a2 2 0 01-2 2H7"
                    />
                  </svg>
                  <span className="text-sm hidden sm:inline">Log in</span>
                </button>
              )}
            </div>

            {/* Book Now */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="hidden lg:inline-flex items-center px-5 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "#0d3966" }}
            >
              <Link href={'/dashboard'}>
              Book Now
              </Link>
            
            </motion.button>

            {/* Mobile menu button */}
            <div className="lg:hidden relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                aria-label="toggle menu"
                className="p-2 rounded-lg bg-[#0d3966] text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: "#0d3966" }}
                    >
                      TM
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0d3966]">
                        Tariq Medical
                      </div>
                      <div className="text-xs text-gray-500">Menu</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <Link
                    href="/"
                    className="block px-4 py-3 rounded-xl text-[#0d3966] font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>

                  {/* Departments Section */}
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Departments
                    </div>

                    <div className="space-y-1">
                      {departments.map((dept: any) => {
                        const deptId = dept._id?.$oid || dept._id || dept.slug;
                        return (
                          <Link
                            key={deptId}
                            href={`/departments/${dept.slug}`}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-linear-to-r hover:from-[#0d3966]/5 hover:to-transparent transition-all group"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#0d3966] to-[#1e5a8e] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-110 transition-transform">
                              {dept.name?.[0] ?? "D"}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-[#0d3966]">
                                {dept.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {dept.description || "Specialized care"}
                              </div>
                            </div>
                            <svg
                              className="w-4 h-4 text-[#0d3966] opacity-0 group-hover:opacity-100 transition-opacity"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-2 px-4">
                      <Link
                        href="/departments"
                        className="text-sm font-medium text-[#0d3966] hover:underline"
                      >
                        Go to all departments!
                      </Link>
                    </div>
                  </div>

                  <Link
                    href="/doctors"
                    className="block px-4 py-3 rounded-xl text-[#0d3966] font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Doctors
                  </Link>
                  <Link
                    href="/about"
                    className="block px-4 py-3 rounded-xl text-[#0d3966] font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-4 py-3 rounded-xl text-[#0d3966] font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>

                {/* Book Now Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-6 px-5 py-3 rounded-xl text-white font-semibold shadow-lg"
                  style={{ background: "#0d3966" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Appointment
                </motion.button>

                {/* Mobile user area */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : session?.user ? (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#0d3966] to-[#1e5a8e] flex items-center justify-center text-white font-semibold">
                        {session.user.name?.[0] ?? "A"}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/auth");
                        }}
                        className="w-full text-left px-4 py-2 rounded-xl bg-[#0d3966] text-white font-semibold"
                      >
                        Log in
                      </button>
                    )}
                    <div>
                      <div className="font-medium text-[#0d3966]">
                        {session?.user?.name ?? (session ? "User" : "")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session?.user?.email ?? ""}
                      </div>
                    </div>
                  </div>

                  {session?.user && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setConfirmOpen(true);
                        }}
                        className="w-full rounded-xl px-4 py-2 bg-red-600 text-white font-semibold"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm logout
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to log out?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={signingOut}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={signingOut}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
              >
                {signingOut ? "Signing out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
