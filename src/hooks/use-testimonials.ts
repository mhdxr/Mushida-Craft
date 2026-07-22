"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@/types";

/**
 * Hook admin untuk moderasi testimoni.
 *
 * List:    GET    /api/admin/testimonials
 * Approve: PATCH  /api/admin/testimonials/[id]
 * Delete:  DELETE /api/admin/testimonials/[id]
 */
export function useTestimonials() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        setError("Sesi berakhir. Silakan login ulang.");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !Array.isArray(json.testimonials)) {
        setError(
          (json && typeof json.message === "string" && json.message) ||
            "Gagal memuat daftar testimoni.",
        );
        return;
      }
      setTestimonials(json.testimonials as Testimonial[]);
    } catch {
      setError("Gagal memuat daftar testimoni. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approve = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        throw new Error("Sesi berakhir. Silakan login ulang.");
      }
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal menyetujui testimoni.");
      }
      await refresh();
      return json.testimonial as Testimonial;
    },
    [refresh, router],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        throw new Error("Sesi berakhir. Silakan login ulang.");
      }
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal menghapus testimoni.");
      }
      await refresh();
    },
    [refresh, router],
  );

  return {
    testimonials,
    isLoading,
    error,
    refresh,
    approve,
    remove,
  };
}
