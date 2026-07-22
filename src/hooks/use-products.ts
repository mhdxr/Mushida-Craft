"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";

/**
 * Hook untuk mengelola data produk via API routes (Supabase backend).
 *
 * Reads:  GET  /api/products                (public)
 * Create: POST /api/admin/products          (admin only)
 * Update: PATCH /api/admin/products/[id]    (admin only)
 * Delete: DELETE /api/admin/products/[id]   (admin only)
 * Reset:  POST /api/admin/products { action: "reset" }  (admin only, non-prod)
 * Upload: POST /api/admin/upload            (admin only)
 */
export function useProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        setError("Sesi berakhir. Silakan login ulang.");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !Array.isArray(json.products)) {
        setError(
          (json && typeof json.message === "string" && json.message) ||
            "Gagal memuat daftar produk.",
        );
        return;
      }
      setProducts(json.products as Product[]);
    } catch {
      setError("Gagal memuat daftar produk. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
      if (res.status === 401) {
        router.replace("/admin/login");
        throw new Error("Sesi berakhir. Silakan login ulang.");
      }
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal membuat produk.");
      }
      await refresh();
      return json.product as Product;
    },
    [refresh, router],
  );

  const update = useCallback(
    async (id: string, input: Partial<Product>) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        throw new Error("Sesi berakhir. Silakan login ulang.");
      }
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal memperbarui produk.");
      }
      await refresh();
      return json.product as Product;
    },
    [refresh, router],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        throw new Error("Sesi berakhir. Silakan login ulang.");
      }
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal menghapus produk.");
      }
      await refresh();
    },
    [refresh, router],
  );

  const reset = useCallback(async () => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    if (res.status === 401) {
      router.replace("/admin/login");
      throw new Error("Sesi berakhir. Silakan login ulang.");
    }
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.message || "Gagal reset data.");
    }
    await refresh();
  }, [refresh, router]);

  const uploadImages = useCallback(
    async (files: File[]): Promise<string[]> => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        throw new Error("Sesi berakhir. Silakan login ulang.");
      }
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
    },
    [router],
  );

  return {
    products,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    reset,
    uploadImages,
  };
}
