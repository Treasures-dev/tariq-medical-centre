// components/admin/modals/ServiceModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SuseFont } from "@/lib/utils";
import { CldUploadWidget } from "next-cloudinary";
import useSWR from "swr";
import { mutate } from "swr";
import {
  serviceSchemaWithRefinement,
  ServiceInput,
} from "@/lib/validators/services";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  afterSave?: (data: any) => void;
  serviceSlug?: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ServiceModal({
  open,
  onClose,
  afterSave,
  serviceSlug,
}: Props) {
  const [imageInfo, setImageInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch service data when editing
  const { data, error, isLoading } = useSWR(
    serviceSlug && open ? `/api/admin/services/${serviceSlug}` : null,
    fetcher
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(serviceSchemaWithRefinement),
    defaultValues: {
      title: "",
      code: "",
      price: 0,
      durationMinutes: 30,
      description: "",
      image: "",
      onOffer: false,
      offerPrice: undefined,
      offerEnds: undefined,
      installmentAvailable: false,
      installmentOptions: {
        parts: undefined,
        intervalDays: undefined,
        firstPaymentPercent: undefined,
      },
    } as any,
  });

  const onOffer = watch("onOffer");
  const basePrice = watch("price");
  const installmentAvailable = watch("installmentAvailable");

  // Populate form when data is loaded
  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      reset();
      setImageInfo(null);
      return;
    }

    if (serviceSlug && data?.data?.[0]) {
      const service = data.data[0];
      
      
      reset({
        title: service.title ?? "",
        price: service.price ?? 0,
        durationMinutes: service.durationMinutes ?? 30,
        description: service.description ?? "",
        image: service.image ?? "",
        onOffer: Boolean(service.onOffer),
        offerPrice: service.offerPrice ?? undefined,
        offerEnds: service.offerEnds
          ? new Date(service.offerEnds).toISOString().slice(0, 10)
          : undefined,
        installmentAvailable: Boolean(service.installmentAvailable),
        installmentOptions: {
          parts: service.installmentOptions?.parts ?? undefined,
          intervalDays: service.installmentOptions?.intervalDays ?? undefined,
          firstPaymentPercent:
            service.installmentOptions?.firstPaymentPercent ?? undefined,
        },
      });

      if (service.image) {
        setImageInfo({ secure_url: service.image });
      }
    }
  }, [serviceSlug, data, open, reset]);

  const handleUploadSuccess = (result: any) => {
    let info = result?.info ?? result;
    if (!info && Array.isArray(result) && result.length > 0)
      info = result[0]?.info ?? result[0];
    const url = info?.secure_url ?? info?.url;
    if (!url) return;
    setImageInfo(info);
    setValue("image", url, { shouldDirty: true, shouldValidate: true });
    setUploading(false);
  };

  async function onSubmit(data: ServiceInput) {
    try {
      const installmentOptionsPayload = data.installmentAvailable
        ? {
            parts:
              data.installmentOptions?.parts != null
                ? Number(data.installmentOptions.parts)
                : undefined,
            intervalDays:
              data.installmentOptions?.intervalDays != null
                ? Number(data.installmentOptions.intervalDays)
                : undefined,
            firstPaymentPercent:
              data.installmentOptions?.firstPaymentPercent != null
                ? Number(data.installmentOptions.firstPaymentPercent)
                : undefined,
          }
        : undefined;

      const payload = {
        ...data,
        image: data.image ?? imageInfo?.secure_url ?? "",
        offerEnds: data.offerEnds
          ? new Date(data.offerEnds).toISOString()
          : undefined,
        installmentOptions: installmentOptionsPayload,
      };

      // Use PATCH for updates to match the API route
      const method = serviceSlug ? "PATCH" : "POST";
      const endpoint = serviceSlug
        ? `/api/admin/services/${serviceSlug}`
        : `/api/admin/services`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error('Service not created successfully!')
      }
      else{
        toast.success('Service created successfully!')
      }


      await mutate("/api/admin/services");

      reset();
      setImageInfo(null);
      onClose();
      afterSave?.(json);
    } catch (err: any) {
      console.error("Failed to save service:", err);
      alert(err?.message ?? "Save failed");
    }
  }

  if (!open) return null;

  return (
    <div
      className={`${SuseFont.className} fixed inset-0 z-50 flex items-center justify-center p-4`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0d3a66]">
            {serviceSlug ? "Edit Service" : "Add Service"}
          </h3>
          <button onClick={onClose} className="text-sm text-[#0d3a66]">
            Close
          </button>
        </div>

        {isLoading && serviceSlug ? (
          <div className="mt-6 text-center text-sm text-gray-600">
            Loading service...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="block text-xs text-[#0d3a66]">Title</label>
              <input
                {...register("title")}
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.title && (
                <div className="text-xs text-red-600">
                  {String(errors.title?.message)}
                </div>
              )}

            

              <label className="block text-xs text-[#0d3a66] mt-2">Price</label>
              <input
                type="number"
                {...register("price", { valueAsNumber: true })}
                className="w-full rounded-md border px-3 py-2"
              />

              <label className="block text-xs text-[#0d3a66] mt-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                {...register("durationMinutes", { valueAsNumber: true })}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-[#0d3a66]">
                Description
              </label>
              <textarea
                {...register("description")}
                className="w-full min-h-[120px] rounded-md border px-3 py-2"
              />

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" {...register("onOffer")} id="onOffer" />
                <label htmlFor="onOffer" className="text-sm text-[#0d3a66]">
                  On Offer
                </label>
              </div>

              {onOffer && (
                <>
                  <label className="block text-xs text-[#0d3a66] mt-2">
                    Offer Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("offerPrice", { valueAsNumber: true })}
                    className="w-full rounded-md border px-3 py-2"
                    onBlur={(e) => {
                      const v = Number(e.currentTarget.value || 0);
                      if (!isNaN(v) && basePrice && v >= Number(basePrice)) {
                        alert("Offer price must be less than base price");
                        setValue("offerPrice", undefined);
                      }
                    }}
                  />
                  {errors.offerPrice && (
                    <div className="text-xs text-red-600">
                      {String(errors.offerPrice?.message)}
                    </div>
                  )}

                  <label className="block text-xs text-[#0d3a66] mt-2">
                    Offer Ends
                  </label>
                  <input
                    type="date"
                    {...register("offerEnds")}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </>
              )}
            </div>

            <div className="col-span-full grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("installmentAvailable")}
                  id="installmentAvailable"
                />
                <label
                  htmlFor="installmentAvailable"
                  className="text-sm text-[#0d3a66]"
                >
                  Installment Available
                </label>
              </div>

              {installmentAvailable && (
                <div className="grid grid-cols-3 gap-2 w-full">
                  <div>
                    <label className="block text-xs text-[#0d3a66]">
                      Parts
                    </label>
                    <input
                      type="number"
                      {...register("installmentOptions.parts", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-md border px-3 py-2"
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#0d3a66]">
                      Interval (days)
                    </label>
                    <input
                      type="number"
                      {...register("installmentOptions.intervalDays", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-md border px-3 py-2"
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#0d3a66]">
                      First Payment (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("installmentOptions.firstPaymentPercent", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-md border px-3 py-2"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-full mt-2">
              <label className="block text-xs text-[#0d3a66] mb-1">Image</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                  {imageInfo?.secure_url ? (
                    <img
                      src={imageInfo.secure_url}
                      alt="service"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <CldUploadWidget
                  signatureEndpoint="/api/admin/cloudinary"
                  onSuccess={handleUploadSuccess}
                  onError={(err) => {
                    console.error("cloud upload error", err);
                    setUploading(false);
                  }}
                  onClose={() => setUploading(false)}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => {
                        setUploading(true);
                        open();
                      }}
                      className="rounded-md bg-[#0d3a66] px-3 py-2 text-sm text-white"
                    >
                      {uploading ? "Uploading…" : "Upload Image"}
                    </button>
                  )}
                </CldUploadWidget>

                {imageInfo?.secure_url && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageInfo(null);
                      setValue("image", "", { shouldDirty: true });
                    }}
                    className="ml-2 text-red-600"
                    title="Remove image"
                  >
                    <Trash2 />
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-full mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="rounded-md bg-[#0d3a66] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {serviceSlug
                  ? isSubmitting
                    ? "Saving..."
                    : "Save changes"
                  : isSubmitting
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}