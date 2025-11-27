// components/DoctorList.tsx
"use client";
import React, { useState, useMemo } from "react";
import {
  Search,
  Stethoscope,
  Award,
  Building2,
  CheckCircle,
  Filter,
} from "lucide-react";
import { Doctor } from "@/lib/types/types";

type Props = {
  doctors: Doctor[];
  loading?: boolean;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedId?: string;
  register: any;
};

export default function DoctorList({
  doctors,
  loading,
  searchTerm,
  onSearchChange,
  selectedId,
  register,
}: Props) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const getDeptName = (dept: any): string => {
    if (!dept) return "";
    if (typeof dept === "string") return dept;
    return dept.name || dept.slug || "";
  };

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    doctors.forEach((doc) => {
      const deptName = getDeptName(doc.dept);
      if (deptName) depts.add(deptName);
    });
    return Array.from(depts).sort();
  }, [doctors]);

  // Filter doctors by department and search
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const deptName = getDeptName(doctor.dept);
      const matchesDept =
        selectedDepartment === "all" || deptName === selectedDepartment;
      const matchesSearch =
        searchTerm === "" ||
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deptName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [doctors, selectedDepartment, searchTerm]);

  return (
    <div>
      {/* Enhanced Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#000080] focus:border-[#000080] transition-all shadow-sm"
          placeholder="Search by name, specialty, or department..."
        />
      </div>

      {/* Department Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">
            Filter by Department
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              selectedDepartment === "all"
                ? "bg-[#000080] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Departments ({doctors.length})
          </button>
          {departments.map((dept) => {
            const count = doctors.filter(
              (d) => getDeptName(d.dept) === dept
            ).length;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedDepartment === dept
                    ? "bg-[#000080] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#000080] mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading doctors...</p>
          </div>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium">
                No doctors found
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : `No doctors available in ${
                      selectedDepartment === "all"
                        ? "any department"
                        : selectedDepartment
                    }`}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 font-medium">
                Showing {filteredDoctors.length}{" "}
                {filteredDoctors.length === 1 ? "doctor" : "doctors"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map((doctor) => {
                  const deptName = getDeptName(doctor.dept);
                  return (
                    <label
                      key={doctor._id}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        selectedId === doctor._id
                          ? "scale-[1.02]"
                          : "hover:scale-[1.02]"
                      }`}
                    >
                      <input
                        {...register("doctorId")}
                        type="radio"
                        value={doctor._id}
                        className="sr-only"
                      />

                      <div
                        className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
                          selectedId === doctor._id
                            ? "ring-4 ring-[#000080] shadow-xl"
                            : "hover:shadow-lg border-2 border-gray-100"
                        }`}
                      >
                        {/* Selection Indicator */}
                        {selectedId === doctor._id && (
                          <div className="absolute top-3 right-3 z-10 bg-[#000080] text-white rounded-full p-1 shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}

                        {/* Gradient Header */}
                        <div className="h-20 bg-linear-to-r from-[#000080] to-[#0a3a68] relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
                          </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="px-5 pb-5">
                          {/* Avatar */}
                          <div className="relative -mt-12 mb-4">
                            {doctor.avatar ? (
                              <img
                                src={doctor.avatar}
                                alt={doctor.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#000080] to-[#0a3a68] flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg mx-auto">
                                {doctor.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                            {doctor.name}
                          </h3>

                          {/* Specialty Badge */}
                          {doctor.specialty && (
                            <div className="flex justify-center mb-3">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#000080] rounded-full text-sm font-semibold">
                                <Award className="w-4 h-4" />
                                {doctor.specialty}
                              </span>
                            </div>
                          )}

                          {/* Department */}
                          {deptName && (
                            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-3">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">{deptName}</span>
                            </div>
                          )}

                          {/* Bio */}
                          {doctor.bio && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 text-center line-clamp-3 leading-relaxed">
                                {doctor.bio}
                              </p>
                            </div>
                          )}

                          {/* Selection Prompt */}
                          <div
                            className={`mt-4 text-center text-sm font-medium transition-all duration-300 ${
                              selectedId === doctor._id
                                ? "text-[#000080]"
                                : "text-gray-400 group-hover:text-[#000080]"
                            }`}
                          >
                            {selectedId === doctor._id
                              ? "✓ Selected"
                              : "Click to select"}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000080;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0a3a68;
        }
      `}</style>
    </div>
  );
}
