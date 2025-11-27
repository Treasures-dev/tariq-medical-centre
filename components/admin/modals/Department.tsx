"use client";

import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, DepartmentInput } from "@/lib/validators/departments";
import { SuseFont } from "@/lib/utils";
import { CldUploadWidget } from "next-cloudinary";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

type DoctorOption = {
  _id: string;
  name: string;
  avatar?: string;
  phone?: string;
  specialty?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  afterSave?: (data: any) => void;
  departmentSlug?: string | null;
};

type PhotoType = {
  secure_url: string;
} | null;


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DepartmentModal({ open, onClose, afterSave, departmentSlug}: Props) {
  const { data, error } = useSWR<{ doctors: DoctorOption[] }>("/api/admin/doctors", fetcher);
  const doctorsList = data?.doctors ?? [];

  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
const [photo, setPhotoInfo] = useState<PhotoType>(null);



  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      doctors: [],
      photo:"",
    },
  });

  // Load existing department for edit
  useEffect(() => {
    if (open && departmentSlug) {
      fetch(`/api/admin/departments/${departmentSlug}`)
        .then(res => res.json())
        .then(json => {
          if (json.ok && json.department) {
            reset({
              name: json.department.name,
              description: json.department.description,
              doctors: json.department.doctors?.map((d: any) => d._id || d) || [],
              photo: json.department.photo
              
            });

            setSelectedDoctors(json.department.doctors?.map((d: any) => d._id || d) || []);
            
           
          } if (json.department.photo) {
            setPhotoInfo({ secure_url: json.dept.photo });
            // ensure form value is set too
            setValue("photo", json.dept.photo , {
              shouldDirty: false,
              shouldValidate: false,
            });
          }
        })
        .catch(err => console.error("Failed to load department:", err));
    } else if (open && !departmentSlug) {
      reset({ name: "", description: "", doctors: [] });
      setSelectedDoctors([]);
      setSaveError(null);
    }
  }, [open, departmentSlug, reset]);


  
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

    setPhotoInfo(info);
    setValue("photo", secureUrl, { shouldDirty: true, shouldValidate: true });
    setUploading(false);
  };


  const toggleDoctor = (id: string) => {
    setSelectedDoctors(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Sync selectedDoctors to form value
  useEffect(() => {
    setValue("doctors", selectedDoctors);
  }, [selectedDoctors, setValue]);

  async function onSubmit(values: DepartmentInput) {
    setSaveError(null);
    
    try {
      const url = departmentSlug
        ? `/api/admin/departments/${departmentSlug}`
        : "/api/admin/departments";
      const method = departmentSlug ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });


      const json = await res.json();
      
      // Check response status and json.ok
      if (!res.ok || !json.ok) {
        toast.error('Department not created Successfully!')
        throw new Error(json.error || `Server returned ${res.status}`);
      }
      else{
        toast.success('Department Successfully created!');
      }



      // Revalidate the departments list
      await mutate("/api/admin/departments");
      
      // Reset form
      reset();
      setSelectedDoctors([]);
      
      // Close modal
      onClose();
      
      // Call afterSave callback
      if (afterSave) {
        afterSave(json.department ?? json);
      }
      
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err?.message || "Failed to save department");
    }
  }

  if (!open) return null;

  return (
    <div className={`${SuseFont.className} fixed inset-0 z-50 flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0d3a66]">
            {departmentSlug ? "Edit Department" : "Add New Department"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all"
              placeholder="Cardiology"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0d3a66] focus:border-transparent transition-all resize-none"
              placeholder="Brief description about the department..."
            />
          </div>


          {/* Doctor Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Doctors</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
              {doctorsList.map(doc => {
                const selected = selectedDoctors.includes(doc._id);
                return (
                  <div
                    key={doc._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selected ? "border-[#0d3a66] bg-[#e6f0ff]" : "border-gray-200 hover:border-[#0d3a66]"
                    }`}
                    onClick={() => toggleDoctor(doc._id)}
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 shrink-0">
                      {doc.avatar ? (
                        <img src={doc.avatar} alt={doc.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-gray-800">{doc.name}</span>
                      {doc.specialty && <span className="text-sm text-gray-500">{doc.specialty}</span>}
                      {doc.phone && <span className="text-sm text-gray-400">{doc.phone}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.doctors && <p className="text-xs text-red-600 mt-1">{errors.doctors.message}</p>}
          </div>

          
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <div className="flex justify-center items-center gap-4">
                  <div className="h-30 w-full overflow-hidden rounded-2xl bg-gray-100 ring-2 ring-gray-200">
                    {photo?.secure_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ photo.secure_url}
                        alt="photo"
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
                        className="flex h-30 items-center gap-2 rounded-lg bg-[#0d3a66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0a2d4d] transition-colors"
                      >
                        <Upload/>
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#0d3a66] rounded-lg hover:bg-[#0a2d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : departmentSlug ? "Update Department" : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}