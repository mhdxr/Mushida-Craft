"use client";

import { useCallback, useEffect, useState } from "react";
import type { Testimonial } from "@/types";

/**
 * Hook admin untuk moderasi testimoni.
 *
 * List:    GET    /api/admin/testimonials
 * Approve: PATCH  /api/admin/testimonials/[id]
 * Delete:  DELETE /api/admin/testimonials/[id]
 */
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && Array.isArray(json.testimonials)) {
        setTestimonials(json.testimonials as Testimonial[]);
      }
    } catch {
      // Biarkan list kosong; error boundary / toast di UI.
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal menyetujui testimoni.");
      }
      await refresh();
      return json.testimonial as Testimonial;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal menghapus testimoni.");
      }
      await refresh();
    },
    [refresh],
  );

  return {
    testimonials,
    isLoading,
    refresh,
    approve,
    remove,
  };
}
