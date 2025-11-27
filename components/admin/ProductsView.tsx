// components/admin/PharmacyProductsView.tsx
"use client";

import useSWR, { mutate } from "swr";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

type Product = {
  _id?: string;
  name: string;
  slug?: string;
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
  createdAt?: string | { $date?: string };
};

type Props = {
  onEdit?: (slug: string) => void;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PharmacyProductsView({ onEdit }: Props) {
  const { data, error, isLoading } = useSWR<{
    data?: Product[];
    products?: Product[];
  }>("/api/admin/products", fetcher, { revalidateOnFocus: true });

  const [deleting, setDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<
    "name-asc" | "name-desc" | "price-desc" | "price-asc" | "newest" | "expiry"
  >("name-asc");

  const products: Product[] = (data?.data ?? data?.products ?? []) as Product[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = products.filter((p) => {
      if (!q) return true;
      return (
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        (p.ingredient ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    });

    arr = arr.sort((a, b) => {
      if (sort === "name-asc")
        return (a.name ?? "").localeCompare(b.name ?? "");
      if (sort === "name-desc")
        return (b.name ?? "").localeCompare(a.name ?? "");
      if (sort === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
      if (sort === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "expiry") {
        const aDate = a.expiry ? new Date(a.expiry) : new Date(0);
        const bDate = b.expiry ? new Date(b.expiry) : new Date(0);
        return aDate.getTime() - bDate.getTime();
      }
      if (sort === "newest") {
        const aDate = a.createdAt
          ? new Date((a.createdAt as any).$date ?? a.createdAt)
          : new Date(0);
        const bDate = b.createdAt
          ? new Date((b.createdAt as any).$date ?? b.createdAt)
          : new Date(0);
        return bDate.getTime() - aDate.getTime();
      }
      return 0;
    });

    return arr;
  }, [products, query, sort]);

  async function handleDelete(slugOrId?: string) {
    if (!slugOrId) return;
    const ok = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!ok) return;

    try {
      setDeleting(slugOrId);
      const res = await fetch(`/api/admin/products/${slugOrId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error("Product not deleted Successfully!");
      } else {
        toast.success("Product deleted Successfully!");
      }
      await mutate("/api/admin/products");
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      alert(err?.message || "Failed to delete product");
    } finally {
      setDeleting(null);
    }
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0d3a66]">
            Pharmacy Products
          </h3>
          <p className="text-sm text-gray-500">
            Manage medicines, inventory, and stock.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKU, or ingredient..."
            className="w-full sm:w-[320px] px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0d3a66]"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white"
            aria-label="Sort products"
          >
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="price-desc">Price (high → low)</option>
            <option value="price-asc">Price (low → high)</option>
            <option value="expiry">Expiry Date</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-600 mb-4">Loading products...</div>
      )}
      {error && (
        <div className="text-sm text-red-600 mb-4">Failed to load products</div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 && !isLoading && !error && (
          <p className="text-gray-500">No products found</p>
        )}

        {filtered.map((product) => {
          const slug = product._id ?? product.slug;
          const priceLabel =
            typeof product.price === "number"
              ? `PKR ${product.price.toLocaleString()}`
              : "—";
          const stockLabel =
            product.quantity != null
              ? `${product.quantity} ${product.unit ?? "pcs"}`
              : "—";
          const expiringSoon = isExpiringSoon(product.expiry);
          const expired = isExpired(product.expiry);

          return (
            <div
              key={slug}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-4">
                <div className="flex items-start gap-4 w-full">
                  {/* image */}
                  <div className="h-16 w-20 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-800">
                        {product.name}
                      </h4>
                      {expired && (
                        <span className="text-xs text-white bg-red-600 px-2 py-0.5 rounded-full font-medium">
                          Expired
                        </span>
                      )}
                      {expiringSoon && !expired && (
                        <span className="text-xs text-white bg-orange-500 px-2 py-0.5 rounded-full font-medium">
                          Expiring Soon
                        </span>
                      )}
                      {product.quantity != null && product.quantity <= 5 && (
                        <span className="text-xs text-white bg-yellow-600 px-2 py-0.5 rounded-full font-medium">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1 max-w-xl line-clamp-2">
                      {product.description ?? "No description"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-[#0d3a66] font-semibold">
                        {priceLabel}
                      </span>

                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        Stock: {stockLabel}
                      </span>

                      {product.ingredient && (
                        <span className="text-xs text-gray-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {product.ingredient}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(slug as string)}
                    disabled={deleting !== null}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0d3a66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(slug as string)}
                    disabled={deleting === slug}
                    aria-label={`Delete ${product.name}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting === slug ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {/* meta row */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div>
                  <strong className="text-gray-700">SKU:</strong>{" "}
                  {product.sku ?? "—"}
                </div>
                {product.expiry && (
                  <div>
                    <strong className="text-gray-700">Expiry:</strong>{" "}
                    {new Date(product.expiry).toLocaleDateString()}
                  </div>
                )}
                {product.mgf && (
                  <div>
                    <strong className="text-gray-700">Mfg:</strong>{" "}
                    {new Date(product.mgf).toLocaleDateString()}
                  </div>
                )}
                {product.usage && (
                  <div>
                    <strong className="text-gray-700">Usage:</strong>{" "}
                    {product.usage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
