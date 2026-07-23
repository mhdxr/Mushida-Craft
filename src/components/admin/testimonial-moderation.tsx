"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Loader2, Star, Trash2, UserRound } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTestimonials } from "@/hooks/use-testimonials";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

type Filter = "pending" | "approved" | "all";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "pending") {
    return <Badge variant="accent">Menunggu</Badge>;
  }
  return <Badge variant="muted">Disetujui</Badge>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} bintang`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-border"
            }`}
          />
        );
      })}
    </div>
  );
}

function TestimonialRow({
  t,
  busy,
  onApprove,
  onDelete,
}: {
  t: Testimonial;
  busy: boolean;
  onApprove: (t: Testimonial) => void;
  onDelete: (t: Testimonial) => void;
}) {
  const isPending = t.status === "pending";

  return (
    <div
      className={`flex flex-col gap-4 border-b border-border/50 p-4 last:border-b-0 md:flex-row md:items-start md:justify-between md:p-5 ${
        isPending ? "bg-accent/5" : "bg-white"
      }`}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-blush-50 text-xs font-semibold text-primary">
          {t.avatar ? (
            <Image
              src={t.avatar}
              alt={t.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            getInitials(t.name) || (
              <UserRound className="h-4 w-4" aria-hidden />
            )
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold tracking-tight">{t.name}</p>
            <StatusBadge status={t.status} />
          </div>

          <StarRating rating={t.rating} />

          <p className="text-sm leading-relaxed text-muted-foreground">
            “{t.message}”
          </p>

          {t.createdAt ? (
            <p className="text-xs text-muted-foreground">
              {new Date(t.createdAt).toLocaleString("id-ID")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 md:pt-0.5">
        {isPending && (
          <Button size="sm" onClick={() => onApprove(t)} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Setujui
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(t)}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Hapus
        </Button>
      </div>
    </div>
  );
}

export function TestimonialModeration() {
  const { testimonials, isLoading, error, refresh, approve, remove } =
    useTestimonials();
  const [busyId, setBusyId] = useState<string | null>(null);
  // Default: antrean menunggu — job harian admin.
  const [filter, setFilter] = useState<Filter>("pending");
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleApprove = async (t: Testimonial) => {
    setBusyId(t.id);
    try {
      await approve(t.id);
      toast.success(`Testimoni dari ${t.name} disetujui.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyetujui testimoni.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteRequest = (t: Testimonial) => {
    setDeleteTarget(t);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setBusyId(deleteTarget.id);
    try {
      await remove(deleteTarget.id);
      toast.success("Testimoni dihapus.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menghapus testimoni.",
      );
    } finally {
      setDeleting(false);
      setBusyId(null);
    }
  };

  const pendingCount = testimonials.filter((t) => t.status === "pending").length;
  const approvedCount = testimonials.length - pendingCount;

  const visible = useMemo(() => {
    if (filter === "pending") {
      return testimonials.filter((t) => t.status === "pending");
    }
    if (filter === "approved") {
      return testimonials.filter((t) => t.status === "approved");
    }
    return testimonials;
  }, [testimonials, filter]);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "pending", label: "Menunggu", count: pendingCount },
    { id: "approved", label: "Disetujui", count: approvedCount },
    { id: "all", label: "Semua", count: testimonials.length },
  ];

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Testimoni
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Setujui sebelum tampil di homepage. Pending ditampilkan dulu.
          </p>
        </div>
      </div>

      {!isLoading && testimonials.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "border-primary/30 bg-blush-50 text-foreground"
                  : "border-border/50 bg-white text-muted-foreground hover:bg-secondary",
              )}
            >
              {f.label}
              <span className="tabular-nums text-muted-foreground">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3 rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-2">
              <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/4 animate-pulse rounded bg-secondary" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => void refresh()}
          >
            Coba lagi
          </Button>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-secondary/20 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm ring-1 ring-border/50">
            <UserRound className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">Belum ada testimoni</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Testimoni yang dikirim pelanggan akan muncul di sini untuk ditinjau.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-white p-10 text-center text-sm text-muted-foreground">
          Tidak ada testimoni di filter ini.
          {filter === "pending" ? " Semua sudah ditinjau." : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
          {visible.map((t) => (
            <TestimonialRow
              key={t.id}
              t={t}
              busy={busyId === t.id}
              onApprove={handleApprove}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Hapus testimoni?"
        description={
          deleteTarget
            ? `Testimoni dari “${deleteTarget.name}” akan dihapus permanen.`
            : ""
        }
        confirmLabel="Hapus"
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
}
