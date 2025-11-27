// app/components/DoctorModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SuseFont } from "@/lib/utils";
import { DoctorInput, doctorSchema } from "@/lib/validators/doctors";
import useSWR from "swr";
import { IUser } from "@/lib/models/User";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  afterSave?: (data: any) => void;
  doctorId?: string | null;
  doctorSlug?: string | null;
};

type departData = {
  data:any
}

export default function DoctorModal({
  open,
  onClose,
  afterSave,
  doctorSlug,
}: Props) {
  const [avatarInfo, setAvatarInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetcher = (url: string) => fetch(url).then((r) => r.json());


  const {data:deptData} = useSWR("api/admin/departments" , fetcher)
  const departments = deptData?.departments ?? deptData?.data ?? []; // tolerant mapping


  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "doctor",
      qualifications: [],
      services: [],
      phone: "",
      bio: "",
      dept: "",
      specialty: "",
      availability: [],
      avatar: "",
    },
  });

  const {
    fields: qualFields,
    append: appendQual,
    remove: removeQual,
  } = useFieldArray<any, "qualifications">({
    control,
    name: "qualifications" as const,
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "services" as const,
  });

  const {
    fields: availabilityFields,
    append: appendAvailability,
    remove: removeAvailability,
  } = useFieldArray({
    control,
    name: "availability",
  });

  // Load doctor data when editing
  useEffect(() => {
    if (open && doctorSlug) {
      setLoading(true);
      fetch(`/api/admin/doctors/${doctorSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.doctor) {
            const doc = data.doctor;
            reset({
              name: doc.name || "",
              email: doc.email || "",
              role: doc.role || "doctor",
              phone: doc.phone || "",
              bio: doc.bio || "",
              dept: doc.dept || "",
              specialty: doc.specialty || "",
              availability: doc.availability || [],
              avatar: doc.avatar || "",
              qualifications: doc.qualifications || [],
              services: doc.services || [],
            });

            if (doc.avatar) {
              setAvatarInfo({ secure_url: doc.avatar });
              // ensure form value is set too
              setValue("avatar", doc.avatar, {
                shouldDirty: false,
                shouldValidate: false,
              });
            }
          }
        })
        .catch((err) => console.error("Failed to load doctor:", err))
        .finally(() => setLoading(false));
    } else if (open && !doctorSlug) {
      reset({
        name: "",
        email: "",
        role: "doctor",
        phone: "",
        bio: "",
        dept: "",
        specialty: "",
        availability: [],
        qualifications: [],
        services: [],
        avatar: "",
      });
      setAvatarInfo(null);
    }
  }, [open, doctorSlug, reset, setValue]);

  const handleUploadSuccess = (result: any) => {
    let info = result?.info ?? result;
    if (!info && Array.isArray(result) && result.length > 0) {
      info = result[0]?.info ?? result[0];
    }

    const secureUrl =
      info?.secure_url ??
      info?.secure_url_https ??
      info?.url ??
      info?.secureUrl ??
      info?.secure_url_https;

    if (!secureUrl) {
      console.warn("Cloudinary result did not contain a secure url:", info);
      setUploading(false);
      return;
    }

    setAvatarInfo(info);
    setValue("avatar", secureUrl, { shouldDirty: true, shouldValidate: true });
    setUploading(false);
  };

  async function onSubmit(data: DoctorInput) {
    try {
      // normalize values: ensure price is number and qualifications trimmed
      const normalized = {
        ...data,
        services: (data.services || []).map((s: any) => ({
          name: String(s.name || "").trim(),
          price: Number(s.price ?? 0),
        })),
        qualifications: (data.qualifications || [])
          .map((q: any) => String(q || "").trim())
          .filter(Boolean),
        avatar:
          data.avatar && String(data.avatar).length
            ? data.avatar
            : avatarInfo?.secure_url ?? null,
      };

      const payload = normalized;


      const url = doctorSlug
        ? `/api/admin/doctors/${doctorSlug}`
        : "/api/admin/doctors";
      const method = doctorSlug ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) {
        toast.error('Doctor not created successfully!')
      }
      else{
        toast.success('Doctor created successfully!')
      }

      reset();
      setAvatarInfo(null);
      onClose();
      afterSave?.(json.doctor ?? json);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err?.message || "Save failed");
    }
  }

  if (!open) return null;

  return (
    <div
      className={`${SuseFont.className} fixed inset-0 z-50 flex items-center justify-center p-4`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#0d3a66]">
              {doctorSlug ? "Edit Doctor" : "Add New Doctor"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {doctorSlug
                ? "Update doctor information"
                : "Fill in the details to add a new doctor"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-[#0d3a66]"
              fill="none"
              viewBox="0 0 24 24"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all"
                  placeholder="Dr. John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(errors.name?.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all"
                  placeholder="doctor@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(errors.email?.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  {...register("role")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all"
                >
                  <option value="doctor">Doctor</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...register("phone")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>

                <select
                  {...register("dept")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all"
                  defaultValue=""
                >
                  <option value="">— Select department —</option>
                  {departments.map((d: any) => (
                    <option key={d._id ?? d.id ?? d.slug} value={d._id ?? d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {errors.dept && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(errors.dept?.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty
                </label>
                <input
                  {...register("specialty")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all"
                  placeholder="Heart Surgery"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Qualifications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Qualifications
                  </label>
                  <button
                    type="button"
                    onClick={()=>appendQual("" as any)}
                    className="text-xs text-[#0d3a66] hover:text-[#0a2d4d]"
                  >
                    Add Qualification
                  </button>
                </div>

                {qualFields.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                  >
                    <input
                      {...register(`qualifications.${i}` as const)}
                      placeholder="MBBS, FCPS"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeQual(i)}
                      className="px-2 py-1 text-sm text-red-600 hover:text-red-800 rounded"
                      aria-label={`Remove qualification ${i + 1}`}
                    >
                      Remove
                    </button>

                    {errors.qualifications?.[i] && (
                      <p className="text-xs text-red-600 ml-2">
                        {String(errors.qualifications[i]?.message)}
                      </p>
                    )}
                  </div>
                ))}

                {qualFields.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No qualifications added yet
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all resize-none"
                  placeholder="Brief description about the doctor..."
                />
              </div>

              {/* Services */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Services
                  </label>
                  <button
                    type="button"
                    onClick={() => appendService({ name: "", price: 0 })}
                    className="text-xs text-[#0d3a66] hover:text-[#0a2d4d]"
                  >
                    Add Service
                  </button>
                </div>

                {serviceFields.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                  >
                    <input
                      {...register(`services.${i}.name` as const)}
                      placeholder="Service Name"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />

                    <input
                      type="number"
                      step={1}
                      {...register(`services.${i}.price` as const, {
                        valueAsNumber: true,
                      })}
                      placeholder="Price"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm w-28"
                    />

                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      className="px-2 py-1 text-sm text-red-600 hover:text-red-800 rounded"
                      aria-label={`Remove service ${i + 1}`}
                    >
                      Delete
                    </button>

                    <div className="flex flex-col text-xs text-red-600 ml-2">
                      {errors.services?.[i]?.name && (
                        <span>{String(errors.services[i]?.name?.message)}</span>
                      )}
                      {errors.services?.[i]?.price && (
                        <span>
                          {String(errors.services[i]?.price?.message)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {serviceFields.length === 0 && (
                  <p className="text-sm text-gray-500">No services added yet</p>
                )}
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">
                    {avatarInfo?.secure_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarInfo.secure_url}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <CldUploadWidget
                    signatureEndpoint="/api/admin/cloudinary"
                    onSuccess={handleUploadSuccess}
                    onError={(err: any) => {
                      console.error("Cloudinary upload error:", err);
                      setUploading(false);
                    }}
                    onClose={() => setUploading(false)}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => {
                          setUploading(true);
                          open?.();
                        }}
                        className="flex items-center gap-2 rounded-lg bg-[#0d3a66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0a2d4d] transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>

              {/* Availability */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Availability
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      appendAvailability({
                        day: "monday",
                        from: "09:00",
                        to: "17:00",
                      })
                    }
                    className="flex items-center gap-1 text-xs font-medium text-[#0d3a66] hover:text-[#0a2d4d]"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Slot
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {availabilityFields.map((f, i) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <select
                        {...register(`availability.${i}.day` as const)}
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm flex-1"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                      <input
                        type="time"
                        {...register(`availability.${i}.from` as const)}
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm w-28"
                      />
                      <input
                        type="time"
                        {...register(`availability.${i}.to` as const)}
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm w-28"
                      />
                      <button
                        type="button"
                        onClick={() => removeAvailability(i)}
                        className="text-red-600 hover:text-red-700 p-1"
                        aria-label={`Remove availability ${i + 1}`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {availabilityFields.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No availability slots added yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="col-span-full flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#0d3a66] rounded-lg hover:bg-[#0a2d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {doctorSlug ? "Update Doctor" : "Create Doctor"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
