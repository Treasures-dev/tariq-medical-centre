"use client";

import React, { useState } from "react";
import useSWR from "swr";

type Prescription = {
  _id: string;
  patientName: string;
  doctorName: string;
  prescription?: {
    medications?: string;
    notes?: string;
    prescribedBy?: string;
    createdAt?: string;
  };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PrescriptionsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const { data, error, mutate } = useSWR("/api/admin/prescriptions", fetcher, {
    refreshInterval: 5000,
  });

  const prescriptions: Prescription[] = data?.data ?? [];

  // Filter prescriptions based on search
  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prescription?.medications?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <div className="text-red-600 font-semibold mb-2">Failed to load prescriptions</div>
        <p className="text-sm text-red-500">Please try refreshing the page</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6 shadow-sm animate-pulse border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-14 w-14 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d3a66]">Prescriptions</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3a66]/20 focus:border-[#0d3a66] w-full sm:w-64"
          />
          <button
            onClick={() => mutate()}
            className="rounded-lg px-4 py-2.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Prescriptions Grid */}
      {filteredPrescriptions.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrescriptions.map((p) => {
            const initials = p.patientName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "P";

            const prescriptionDate = p.prescription?.createdAt
              ? new Date(p.prescription.createdAt)
              : null;

            const formattedDate = prescriptionDate
              ? prescriptionDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date not available";

            const formattedTime = prescriptionDate
              ? prescriptionDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={p._id}
                onClick={() => setSelectedPrescription(p)}
                className="group rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer relative overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#0d3a66]/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

                {/* Header */}
                <div className="relative flex items-start gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-linear-to-br from-[#0d3a66] to-[#1e5a8e] flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#0d3a66] truncate group-hover:text-[#1e5a8e] transition-colors">
                      {p.patientName || "Unknown Patient"}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Dr. {p.doctorName || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Medications */}
                <div className="relative space-y-3 mb-4">
                  <div className="bg-linear-to-r from-blue-50 to-transparent rounded-lg p-3 border-l-4 border-[#0d3a66]">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#0d3a66] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0d3a66] mb-1">Medications</p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {p.prescription?.medications || "No medications listed"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {p.prescription?.notes && (
                    <div className="bg-linear-to-r from-amber-50 to-transparent rounded-lg p-3 border-l-4 border-amber-500">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{p.prescription.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="relative flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formattedDate}</span>
                  </div>
                  {formattedTime && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formattedTime}</span>
                    </div>
                  )}
                </div>

               
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No prescriptions found</h3>
          <p className="text-sm text-gray-600">
            {searchTerm ? "Try adjusting your search terms" : "Prescriptions will appear here once created"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPrescription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedPrescription(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-[#0d3a66] to-[#1e5a8e] text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Prescription Details</h3>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-[#0d3a66] to-[#1e5a8e] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {selectedPrescription.patientName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "P"}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#0d3a66]">
                    {selectedPrescription.patientName || "Unknown Patient"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Prescribed by: Dr. {selectedPrescription.doctorName || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedPrescription.prescription?.createdAt
                      ? new Date(selectedPrescription.prescription.createdAt).toLocaleString("en-US", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })
                      : "Date not available"}
                  </p>
                </div>
              </div>

              {/* Medications */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-[#0d3a66] rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-bold text-[#0d3a66]">Medications</h5>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedPrescription.prescription?.medications || "No medications listed"}
                </p>
              </div>

              {/* Notes */}
              {selectedPrescription.prescription?.notes && (
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-amber-500 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h5 className="text-lg font-bold text-amber-700">Additional Notes</h5>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedPrescription.prescription.notes}
                  </p>
                </div>
              )}

      
            </div>
          </div>
        </div>
      )}
    </div>
  );
}