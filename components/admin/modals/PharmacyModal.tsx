// ============================================
// FILE 2: components/admin/modals/PharmacyModal.tsx
// ============================================
"use client";

import React, { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacySchema, PharmacyInput } from "@/lib/validators/pharmacy";
import { SuseFont } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  afterSave?: (data?: any) => void;
  productSlug?: string;
};

export default function PharmacyModal({ open, onClose, afterSave, productSlug }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PharmacyInput>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      quantity: 0,
      unit: "pcs",
      description: "",
      images: [],
      usage: "",
      ingredient: "",
      expiry: "",
      mgf: "",
    },
  });

  // Load product data when editing
  useEffect(() => {
    if (!open || !productSlug) {
      // Reset when creating new product
      reset();
      setImages([]);
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/products/${productSlug}`);
        if (!res.ok) throw new Error("Failed to load product");
        
        const data = await res.json();
        const product = data.data || data;

        // Populate form fields
        reset({
          name: product.name || "",
          sku: product.sku || "",
          price: product.price || 0,
          quantity: product.quantity || 0,
          unit: product.unit || "pcs",
          description: product.description || "",
          usage: product.usage || "",
          ingredient: product.ingredient || "",
          expiry: product.expiry || "",
          mgf: product.mgf || "",
        });

        // Set images
        if (product.images && Array.isArray(product.images)) {
          setImages(product.images);
          setValue("images", product.images);
        }
      } catch (err) {
        console.error("Load product error:", err);
        toast.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [open, productSlug, reset, setValue]);

  // Prevent body scroll while modal open
  useEffect(() => {
    if (!open) return;
    const previous = { overflow: document.body.style.overflow || "" };
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous.overflow;
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Robust Cloudinary result parsing
  const handleUploadSuccess = (result: any) => {
    try {
      let newUrls: string[] = [];

      if (Array.isArray(result)) {
        newUrls = result.map((r) => r?.secure_url ?? r?.url ?? r?.secureUrl).filter(Boolean);
      } else if (result?.info) {
        const info = result.info;
        const url = info?.secure_url ?? info?.url ?? info?.secureUrl;
        if (url) newUrls = [url];
      } else if (result?.length) {
        newUrls = Array.from(result).map((r: any) => r?.secure_url ?? r?.url).filter(Boolean);
      } else if (result?.secure_url || result?.url) {
        newUrls = [result.secure_url ?? result.url];
      }

      if (newUrls.length === 0) {
        setUploading(false);
        return;
      }

      setImages((prev) => {
        const updated = [...prev, ...newUrls];
        setValue("images", updated, { shouldDirty: true, shouldValidate: true });
        return updated;
      });
    } catch (err) {
      console.error("handleUploadSuccess parse error:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImageAt = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setValue("images", next, { shouldDirty: true, shouldValidate: true });
      return next;
    });
  };

  async function onSubmit(data: PharmacyInput) {
    setUploading(true);
    try {
      const payload = { ...data, images };
      const url = productSlug 
        ? `/api/admin/products/${productSlug}` 
        : "/api/admin/products";
      const method = productSlug ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      
      if (!json?.ok) {
        toast.error(productSlug ? 'Product not updated successfully!' : 'Product not created successfully!');
      } else {
        toast.success(productSlug ? 'Product updated successfully!' : 'Product created successfully!');
        reset();
        setImages([]);
        afterSave?.(json);
        onClose();
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message ?? "Save failed");
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  const widgetOptions: Record<string, any> = {
    multiple: true,
    maxFiles: 10,
  };

  return (
    <div
      className={`${SuseFont.className} fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4`}
      role="dialog"
      aria-modal="true"
      aria-label="Add or edit pharmacy product"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!isSubmitting && !uploading) onClose();
        }}
      />

      {/* modal panel */}
      <div className="relative z-10 w-full max-w-md sm:max-w-2xl md:max-w-3xl rounded-xl bg-white p-4 sm:p-6 shadow-xl ring-1 ring-black/5 max-h-[calc(100vh-3.5rem)] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#0d3a66]">
            {productSlug ? "Edit Product" : "Add Product"}
          </h3>
          <button
            onClick={() => { if (!isSubmitting && !uploading) onClose(); }}
            className="text-sm text-[#0d3a66] px-2 py-1 rounded hover:bg-gray-100"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d3a66]"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs text-[#0d3a66]">Product Name</label>
              <input
                {...register("name")}
                className="w-full rounded-md border px-3 py-2"
              />
              {errors.name && <div className="text-xs text-red-600">{String(errors.name?.message)}</div>}

              <label className="block text-xs text-[#0d3a66] mt-2">SKU</label>
              <input {...register("sku")} className="w-full rounded-md border px-3 py-2" />

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs text-[#0d3a66] mt-2">Quantity</label>
                  <input type="number" {...register("quantity", { valueAsNumber: true })} className="w-full rounded-md border px-3 py-2" />
                </div>

                <div className="w-1/2">
                  <label className="block text-xs text-[#0d3a66] mt-2">Unit</label>
                  <input {...register("unit")} className="w-full rounded-md border px-3 py-2" />
                </div>
              </div>

              <label className="block text-xs text-[#0d3a66] mt-2">Price (PKR)</label>
              <input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="w-full rounded-md border px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-[#0d3a66]">Description</label>
              <textarea {...register("description")} className="w-full min-h-[120px] rounded-md border px-3 py-2" />

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs text-[#0d3a66] mt-2">Manufacturing Date</label>
                  <input type="date" {...register("mgf")} className="w-full rounded-md border px-3 py-2" />
                  {errors.mgf && <div className="text-xs text-red-600">{String(errors.mgf?.message)}</div>}
                </div>

                <div className="w-1/2">
                  <label className="block text-xs text-[#0d3a66] mt-2">Expiry Date</label>
                  <input type="date" {...register("expiry")} className="w-full rounded-md border px-3 py-2" />
                  {errors.expiry && <div className="text-xs text-red-600">{String(errors.expiry?.message)}</div>}
                </div>
              </div>
            </div>

            {/* usage */}
            <div className="space-y-2">
              <label className="block text-xs text-[#0d3a66]">Usage / Directions</label>
              <textarea {...register("usage")} className="w-full min-h-20 rounded-md border px-3 py-2" />
              {errors.usage && <div className="text-xs text-red-600">{String(errors.usage?.message)}</div>}
            </div>

            {/* ingredient */}
            <div className="space-y-2">
              <label className="block text-xs text-[#0d3a66]">Ingredient / Composition</label>
              <input {...register("ingredient")} className="w-full rounded-md border px-3 py-2" />
              {errors.ingredient && <div className="text-xs text-red-600">{String(errors.ingredient?.message)}</div>}
            </div>

            {/* images + upload */}
            <div className="col-span-full">
              <label className="block text-xs text-[#0d3a66]">Product Images</label>
              <div className="mt-2 flex gap-3 items-start">
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {images.length === 0 ? (
                    <div className="col-span-4 rounded-md bg-gray-50 p-3 text-xs text-gray-400">No images uploaded</div>
                  ) : (
                    images.map((src, i) => (
                      <div key={src + i} className="relative h-20 w-20 overflow-hidden rounded-md border">
                        <img src={src} alt={`product-${i}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeImageAt(i)} className="absolute top-1 right-1 rounded-md bg-white/80 p-1">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <CldUploadWidget
                    signatureEndpoint="/api/admin/cloudinary"
                    onSuccess={(res: any) => handleUploadSuccess(res)}
                    onError={(err: any) => {
                      console.error("Upload error:", err);
                      setUploading(false);
                    }}
                    options={widgetOptions}
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? undefined}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => {
                          setUploading(true);
                          open?.();
                        }}
                        className="rounded-md bg-[#0d3a66] px-3 py-2 text-sm text-white whitespace-nowrap"
                      >
                        {uploading ? "Uploading…" : "Upload Images"}
                      </button>
                    )}
                  </CldUploadWidget>

                  <div className="text-xs text-gray-500 max-w-40 text-right">You can upload multiple images. Use clear photos of product packaging.</div>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="col-span-full flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting && !uploading) {
                    reset();
                    setImages([]);
                    onClose();
                  }
                }}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="rounded-md bg-[#0d3a66] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {isSubmitting || uploading ? "Saving…" : productSlug ? "Update" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
