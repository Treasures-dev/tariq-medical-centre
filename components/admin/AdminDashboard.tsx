"use client";

import React, { useState } from "react";
import { SuseFont } from "@/lib/utils";
import { AppointmentsView } from "@/components/admin/Appointments";
import { Sidebar, Topbar, StatCard } from "@/components/admin/Component";
import DoctorModal from "@/components/admin/DoctorModal";
import ServiceModal from "@/components/admin/modals/ServiceModal";
import PharmacyModal from "@/components/admin/modals/PharmacyModal";
import OngoingTreatmentModal from "@/components/admin/modals/OnGoing";
import DoctorsView from "@/components/admin/Doctors";
import DepartmentModal from "./modals/Department";
import { DepartmentsView } from "./DepartmentsView";
import { ServicesView } from "./ServicesView";
import { PharmacyProductsView } from "./ProductsView";
import { PrescriptionsView } from "./PrescriptionsView";
import { JobsApplicationsView } from "./JobsApplications";
import { OngoingTreatmentsView } from "./TreatmentsView";
import AdminOverviewRealtime from "./Overview";

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
            {active === "overview" && (
              <AdminOverviewRealtime/>
            )}

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
                  onEdit={(id) => {
                    // optional: capture id if you later add edit support
                    // setTreatmentId(id); // if you add state to hold id
                    setTreatmentOpen(true);
                  }}
                  key={refreshKey}
                />
              </div>
            )}
          </div>

          {/* Modals */}
          <DoctorModal
            doctorId={doctorId}
            doctorSlug={doctorSlug}
            open={isDoctorOpen}
            onClose={closeAll}
            afterSave={() => setRefreshKey((k) => k + 1)}
          />

          <ServiceModal
            open={isServiceOpen}
            onClose={() => {
              setServiceOpen(false);
              setServiceEditSlug(null);
            }}
            afterSave={() => setRefreshKey((k) => k + 1)}
            serviceSlug={serviceEditSlug ?? undefined}
          />

          <PharmacyModal
            open={isPharmacyOpen}
            onClose={() => {
              setPharmacyOpen(false);
              setProductEditSlug(null);
            }}
            afterSave={() => setRefreshKey((k) => k + 1)}
            productSlug={productEditSlug ?? undefined}
          />

          <OngoingTreatmentModal
            open={isTreatmentOpen}
            onClose={closeAll}
            afterSave={() => setRefreshKey((k) => k + 1)}
          />

          <DepartmentModal
            open={isDepartmentOpen}
            onClose={() => {
              setDepartmentOpen(false);
              setDepartmentSlug("");
            }}
            afterSave={() => setRefreshKey((k) => k + 1)}
            departmentSlug={departmentSlug}
          />
        </main>
      </div>
    </div>
  );
}
