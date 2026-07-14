"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types";

/**
 * Hook untuk mengelola data produk via API routes (Supabase backend).
 *
 * Reads:  GET  /api/admin/products          (public, anon key)
 * Create: POST /api/admin/products          (admin only, service role)
 * Update: PATCH /api/admin/products/[id]    (admin only)
 * Delete: DELETE /api/admin/products/[id]   (admin only)
 * Reset:  POST /api/admin/products { action: "reset" }  (admin only)
 * Upload: POST /api/admin/upload            (admin only, service role)
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setProducts(json.products as Product[]);
      }
    } catch {
      // Error sudah ditangani oleh error boundary; biarkan list kosong.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: Omit<Product, "id" | "createdAt">) => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal membuat produk.");
      }
      await refresh();
      return json.product as Product;
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, input: Partial<Product>) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal memperbarui produk.");
      }
      await refresh();
      return json.product as Product;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal menghapus produk.");
      }
      await refresh();
    },
    [refresh],
  );

  const reset = useCallback(async () => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.message || "Gagal reset data.");
    }
    await refresh();
  }, [refresh]);

  const uploadImages = useCallback(async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const json = (await res.json().catch(() => null)) as {
      ok?: boolean;
      message?: string;
      urls?: unknown;
    } | null;
    if (!res.ok || !json?.ok) {
      throw new Error(json?.message || "Gagal mengunggah gambar.");
    }
    if (
      !Array.isArray(json.urls) ||
      !json.urls.every((url): url is string => typeof url === "string")
    ) {
      throw new Error("Respons upload gambar tidak valid.");
    }
    return json.urls;
  }, []);

  return {
    products,
    isLoading,
    refresh,
    create,
    update,
    remove,
    reset,
    uploadImages,
  };
}
