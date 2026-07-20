"use client";

import { Check, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTestimonials } from "@/hooks/use-testimonials";
import { toast } from "@/hooks/use-toast";
import type { Testimonial } from "@/types";

function StatusBadge({ status }: { status?: string }) {
  if (status === "pending") {
    return <Badge variant="accent">Menunggu</Badge>;
  }
  return <Badge variant="muted">Disetujui</Badge>;
}

function TestimonialRow({
  t,
  onApprove,
  onDelete,
}: {
  t: Testimonial;
  onApprove: (t: Testimonial) => void;
  onDelete: (t: Testimonial) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/60 p-4 last:border-b-0 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{t.name}</p>
          {t.role ? (
            <span className="text-xs text-muted-foreground">· {t.role}</span>
          ) : null}
          <StatusBadge status={t.status} />
        </div>
        <div
          className="flex items-center gap-0.5 text-amber-400"
          aria-label={`${t.rating} bintang`}
        >
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          “{t.message}”
        </p>
        {t.createdAt ? (
          <p className="text-xs text-muted-foreground">
            {new Date(t.createdAt).toLocaleString("id-ID")}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        {t.status === "pending" && (
          <Button size="sm" onClick={() => onApprove(t)}>
            <Check className="h-4 w-4" />
            Setujui
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onDelete(t)}>
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
      </div>
    </div>
  );
}

export function TestimonialModeration() {
  const { testimonials, isLoading, approve, remove } = useTestimonials();

  const handleApprove = async (t: Testimonial) => {
    try {
      await approve(t.id);
      toast.success(`Testimoni dari ${t.name} disetujui.`);
    } catch {
      toast.error("Gagal menyetujui testimoni.");
    }
  };

  const handleDelete = async (t: Testimonial) => {
    if (!window.confirm(`Hapus testimoni dari "${t.name}"?`)) return;
    try {
      await remove(t.id);
      toast.success("Testimoni dihapus.");
    } catch {
      toast.error("Gagal menghapus testimoni.");
    }
  };

  const pendingCount = testimonials.filter((t) => t.status === "pending").length;

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            Moderasi Testimoni
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Setujui testimoni pelanggan sebelum ditampilkan di homepage.
            {pendingCount > 0
              ? ` ${pendingCount} menunggu persetujuan.`
              : " Tidak ada yang menunggu."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border/60 bg-white p-10 text-center text-sm text-muted-foreground">
          Memuat testimoni...
        </div>
      ) : testimonials.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-white p-10 text-center text-sm text-muted-foreground">
          Belum ada testimoni yang dikirim.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
          {testimonials.map((t) => (
            <TestimonialRow
              key={t.id}
              t={t}
              onApprove={handleApprove}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
