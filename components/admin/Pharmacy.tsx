"use client";

import React from "react";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PharmacyModal from "./modals/PharmacyModal";
type Product = {
  _id?: string;
  name: string;
  sku?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  description?: string;
  images?: string[];
  usage?: string;
  ingredient?: string;
  expiry?: string;
  mgf?: string;
  slug?: string;
  createdAt?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const txt = await res.text();
  let data: any;
  try {
    data = txt ? JSON.parse(txt) : null;
  } catch {
    data = txt;
  }
  if (!res.ok) {
    const err: any = new Error(data?.error || `Request failed ${res.status}`);
    err.info = data;
    throw err;
  }
  return data;
};

export default function PharmacyView() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/products", fetcher);
  const products: Product[] = Array.isArray(data) ? data : data?.data || [];
  const router = useRouter();

  // modal state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const openCreate = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };
  const openEdit = (idOrSlug: string) => {
    setEditingId(idOrSlug);
    setIsModalOpen(true);
  };

  const handleDelete = async (idOrSlug: string) => {
    if (!confirm("Delete this item? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${idOrSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) throw new Error(json.error || "Delete failed");
      await mutate();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d3a66]">Pharmacy</h2>
          <p className="text-sm text-gray-600 mt-1">Manage products and inventory</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="rounded-lg px-4 py-2.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            Refresh
          </button>

          <button
            onClick={openCreate}
            className="rounded-lg px-4 py-2.5 text-sm font-medium bg-[#0d3a66] text-white hover:bg-[#0a2d4d] transition-colors shadow-sm"
          >
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Error loading products — {String((error as any)?.message ?? error)}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="h-36 w-full rounded bg-gray-200 mb-4" />
              <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p._id ?? p.slug ?? p.name}
                  className="group rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
                >
                  <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden bg-gray-50">
                    {p.images && p.images[0] ? (
                      // next/image requires domain config; fallback <img> if not configured
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#0d3a66] mb-1 truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="font-medium text-gray-800">SKU:</span>
                    <span>{p.sku ?? "-"}</span>
                  </div>

                  <div className="flex gap-2 items-center mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-medium text-gray-900">₹{p.price?.toLocaleString() ?? 0}</p>
                    </div>
                    <div className="ml-4">
                      <p className="text-xs text-gray-500">Qty</p>
                      <p className={`text-sm font-medium ${p.quantity && p.quantity > 0 ? "text-gray-900" : "text-red-600"}`}>
                        {p.quantity ?? 0} {p.unit ?? ""}
                      </p>
                    </div>
                    <div className="ml-4">
                      <p className="text-xs text-gray-500">Expiry</p>
                      <p className="text-sm font-medium text-gray-900">{p.expiry ?? "-"}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{p.description ?? ""}</p>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        // go to product public page — fallback to id-based route
                        const path = p.slug ? `/products/${p.slug}` : `/products/id/${p._id}`;
                        try { router.push(path); } catch { window.location.href = path; }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-[#0d3a66] text-white hover:bg-[#0a2d4d] transition-all duration-200"
                    >
                      View
                    </button>

                    <button
                      onClick={() => openEdit(p.slug ?? p._id ?? "")}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(p._id ?? p.slug ?? "")}
                      className="flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No products</h3>
              <p className="text-sm text-gray-600">Add products to your pharmacy to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PharmacyModal
          open={isModalOpen}
          productSlug={""}
          onClose={() => { setIsModalOpen(false); setEditingId(null); }}
          afterSave={() => { mutate(); setIsModalOpen(false); setEditingId(null); }}
        />
      )}
    </div>
  );
}
