"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { SuseFont } from "@/lib/utils";
import { Sidebar, Topbar } from "@/components/admin/Component";

/* --------------------
   Beautiful blue loader
   --------------------
   - Tailwind utility classes used for quick styling
   - Accessible (aria-live)
*/
function BlueLoader({ text = "Loading…" }: { text?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 p-4"
    >
      {/* Spinner */}
      <svg
        className="animate-spin h-8 w-8 text-blue-600"
        viewBox="0 0 24 24"
        fill="none"
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
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      {/* Text + subtle skeleton bar */}
      <div className="flex flex-col">
        <span className="text-blue-700 font-medium">{text}</span>
        <div className="mt-2 w-40 h-2 bg-blue-100 rounded overflow-hidden">
          <div className="h-2 bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 opacity-90 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* --------------------
   Dynamic imports (with loading)
   -------------------- */
/* Views (allow SSR where possible — just provide loading UI) */
const AdminOverviewRealtime = dynamic(() => import("./Overview"), {
  loading: () => <BlueLoader text="Loading overview…" />,
});
const DoctorsView = dynamic(() => import("./Doctors"), {
  loading: () => <BlueLoader text="Loading doctors…" />,
});
const AppointmentsView = dynamic(() => import("@/components/admin/Appointments"), {
  loading: () => <BlueLoader text="Loading appointments…" />,
});
const DepartmentsView = dynamic(() => import("./DepartmentsView"), {
  loading: () => <BlueLoader text="Loading departments…" />,
});
const ServicesView = dynamic(() => import("./ServicesView"), {
  loading: () => <BlueLoader text="Loading services…" />,
});
const PharmacyProductsView = dynamic(() => import("./ProductsView"), {
  loading: () => <BlueLoader text="Loading pharmacy…" />,
});
const PrescriptionsView = dynamic(() => import("./PrescriptionsView"), {
  loading: () => <BlueLoader text="Loading prescriptions…" />,
});
const JobsApplicationsView = dynamic(() => import("./JobsApplications"), {
  loading: () => <BlueLoader text="Loading applications…" />,
});
const OngoingTreatmentsView = dynamic(() => import("./TreatmentsView"), {
  loading: () => <BlueLoader text="Loading treatments…" />,
});

/* Modals (client-only) — load only in browser and show loader while fetching */
const DoctorModal = dynamic(
  () => import("@/components/admin/DoctorModal"),
  {  loading: () => <BlueLoader text="Preparing doctor form…" /> }
);
const ServiceModal = dynamic(
  () => import("@/components/admin/modals/ServiceModal"),
  {  loading: () => <BlueLoader text="Preparing service form…" /> }
);
const PharmacyModal = dynamic(
  () => import("@/components/admin/modals/PharmacyModal"),
  {  loading: () => <BlueLoader text="Preparing product form…" /> }
);
const OngoingTreatmentModal = dynamic(
  () => import("@/components/admin/modals/OnGoing"),
  {  loading: () => <BlueLoader text="Preparing treatment form…" /> }
);
const DepartmentModal = dynamic(() => import("./modals/Department"), {
  
  loading: () => <BlueLoader text="Preparing department form…" />,
});

/* --------------------
   Main admin dashboard
   -------------------- */
export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);

  // modal states
  const [isDoctorOpen, setDoctorOpen] = useState(false);
  const [isServiceOpen, setServiceOpen] = useState(false);
  const [isPharmacyOpen, setPharmacyOpen] = useState(false);
  const [isTreatmentOpen, setTreatmentOpen] = useState(false);
  const [isDepartmentOpen, setDepartmentOpen] = useState(false);

  // edit slugs/ids
  const [doctorId, setDoctorId] = useState("");
  const [serviceEditSlug, setServiceEditSlug] = useState<string | null>(null);
  const [productEditSlug, setProductEditSlug] = useState<string | any>(null);
  const [doctorSlug, setDoctorSlug] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    switch (active) {
      case "doctors":
        setDoctorOpen(true);
        break;
      case "services":
        setServiceOpen(true);
        break;
      case "pharmacy":
        setPharmacyOpen(true);
        break;
      case "ongoing":
        setTreatmentOpen(true);
        break;
      case "departments":
        setDepartmentOpen(true);
        break;
      default:
        break;
    }
  };

  const closeAll = () => {
    setDoctorOpen(false);
    setServiceOpen(false);
    setPharmacyOpen(false);
    setTreatmentOpen(false);
    setDepartmentOpen(false);
    setDepartmentSlug("");
    setServiceEditSlug(null);
    setProductEditSlug(null);
  };

  const doctorSlugExtract = (slug: string) => {
    setDoctorSlug(slug);
    setDoctorOpen(true);
  };

  const editDepartment = (slug: string) => {
    setDepartmentOpen(true);
    setDepartmentSlug(slug);
  };

  const editService = (slug: string) => {
    setServiceOpen(true);
    setServiceEditSlug(slug);
  };

  const editProduct = (slug: string) => {
    setPharmacyOpen(true);
    setProductEditSlug(slug);
  };

  return (
    <div
      className={`${SuseFont.className} min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6`}
    >
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
        <Sidebar
          active={active}
          onChange={setActive}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <main className="flex flex-col gap-6">
          <Topbar onCreate={handleCreate} activeTab={active} />

          <div className="px-1">
            {active === "overview" && <AdminOverviewRealtime />}

            {active === "doctors" && (
              <DoctorsView onEdit={doctorSlugExtract} key={refreshKey} />
            )}

            {active === "appointments" && <AppointmentsView />}
            {active === "prescriptions" && <PrescriptionsView />}
            {active === "applications" && <JobsApplicationsView />}

            {active === "pharmacy" && (
              <div className="p-6">
                <PharmacyProductsView onEdit={editProduct} key={refreshKey} />
              </div>
            )}

            {active === "services" && (
              <div className="p-6">
                <ServicesView onEdit={editService} key={refreshKey} />
              </div>
            )}

            {active === "departments" && (
              <div className="p-6">
                <DepartmentsView onEdit={editDepartment} key={refreshKey} />
              </div>
            )}

            {active === "ongoing" && (
              <div className="p-6">
                <OngoingTreatmentsView
                  onEdit={() => {
                    setTreatmentOpen(true);
                  }}
                  key={refreshKey}
                />
              </div>
            )}
          </div>

          {/* ---------- Modals (render only when open) ---------- */}
          {isDoctorOpen && (
            <DoctorModal
              doctorId={doctorId}
              doctorSlug={doctorSlug}
              open={isDoctorOpen}
              onClose={closeAll}
              afterSave={() => setRefreshKey((k) => k + 1)}
            />
          )}

          {isServiceOpen && (
            <ServiceModal
              open={isServiceOpen}
              onClose={() => {
                setServiceOpen(false);
                setServiceEditSlug(null);
              }}
              afterSave={() => setRefreshKey((k) => k + 1)}
              serviceSlug={serviceEditSlug ?? undefined}
            />
          )}

          {isPharmacyOpen && (
            <PharmacyModal
              open={isPharmacyOpen}
              onClose={() => {
                setPharmacyOpen(false);
                setProductEditSlug(null);
              }}
              afterSave={() => setRefreshKey((k) => k + 1)}
              productSlug={productEditSlug ?? undefined}
            />
          )}

          {isTreatmentOpen && (
            <OngoingTreatmentModal
              open={isTreatmentOpen}
              onClose={closeAll}
              afterSave={() => setRefreshKey((k) => k + 1)}
            />
          )}

          {isDepartmentOpen && (
            <DepartmentModal
              open={isDepartmentOpen}
              onClose={() => {
                setDepartmentOpen(false);
                setDepartmentSlug("");
              }}
              afterSave={() => setRefreshKey((k) => k + 1)}
              departmentSlug={departmentSlug}
            />
          )}
        </main>
      </div>
    </div>
  );
}
