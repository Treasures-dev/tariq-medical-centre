// app/(your-path)/dashboard/page.tsx
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { auth } from "@/auth";
import { headers } from "next/headers";
import RedirectModal from "@/components/common/RedirectModal";

// Lazy/dynamic imports — use suspense so only the required chunk is loaded
const AdminDashboard = dynamic(
  () => import("@/components/admin/AdminDashboard"),

);
const DoctorDashboardPage = dynamic(
  () => import("@/components/doctor/Dashboard"),

);
const PatientDashboardPage = dynamic(
  () => import("@/components/patients/Dashboard"),
);

// Small loading fallback (server component safe)
function LoadingFallback({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-gray-600">
      <svg
        className="animate-spin h-6 w-6 mr-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>{text}</span>
    </div>
  );
}

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <RedirectModal
        title="Access Denied"
        message="You must be logged in to access the dashboard. Redirecting to login..."
        redirectUrl="/auth"
        redirectDelay={3000}
      />
    );
  }

  const role = session.user?.role;

  // Lazy-render only the dashboard needed for this role
  switch (role) {
    case "admin":
      return (
        <Suspense fallback={<LoadingFallback text="Loading admin dashboard..." />}>
          <AdminDashboard />
        </Suspense>
      );

    case "doctor":
      return (
        <Suspense fallback={<LoadingFallback text="Loading doctor dashboard..." />}>
          <DoctorDashboardPage />
        </Suspense>
      );

    case "patient":
      return (
        <Suspense fallback={<LoadingFallback text="Loading patient dashboard..." />}>
          <PatientDashboardPage />
        </Suspense>
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-700">
          Unknown role
        </div>
      );
  }
};

export default Dashboard;
