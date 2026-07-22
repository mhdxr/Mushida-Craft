"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Save, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CategoryRecord } from "@/lib/category-api";

type Draft = {
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

function toDraft(c: CategoryRecord): Draft {
  return {
    name: c.name,
    description: c.description,
    icon: c.icon ?? "",
    sortOrder: c.sortOrder ?? 0,
    isActive: c.isActive !== false,
  };
}

export function AdminCategories() {
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal memuat kategori.");
      }
      const list = json.categories as CategoryRecord[];
      setItems(list);
      const next: Record<string, Draft> = {};
      for (const c of list) next[c.id] = toDraft(c);
      setDrafts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat kategori.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const isDirty = (c: CategoryRecord) => {
    const d = drafts[c.id];
    if (!d) return false;
    return (
      d.name !== c.name ||
      d.description !== c.description ||
      d.icon !== (c.icon ?? "") ||
      d.sortOrder !== (c.sortOrder ?? 0) ||
      d.isActive !== (c.isActive !== false)
    );
  };

  const save = async (id: string) => {
    const d = drafts[id];
    if (!d) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          description: d.description,
          icon: d.icon,
          sortOrder: d.sortOrder,
          isActive: d.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Gagal menyimpan kategori.");
      }
      const updated = json.category as CategoryRecord;
      setItems((prev) =>
        prev.map((row) => (row.id === id ? updated : row)).sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        ),
      );
      setDrafts((prev) => ({ ...prev, [id]: toDraft(updated) }));
      toast.success(`Kategori “${updated.name}” disimpan.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan kategori.",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            Katalog
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Kategori
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit nama, deskripsi, urutan, dan status tampil. ID slug tetap
            (terikat produk) — tidak bisa menambah kategori baru lewat UI.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Muat ulang
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border/50 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Tags className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium">Belum ada data kategori</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Jalankan migrasi{" "}
            <code className="rounded bg-secondary px-1">0008_categories</code>{" "}
            di Supabase.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((c) => {
            const d = drafts[c.id] ?? toDraft(c);
            const dirty = isDirty(c);
            const busy = savingId === c.id;
            return (
              <li
                key={c.id}
                className={cn(
                  "rounded-2xl border bg-white p-5 shadow-sm",
                  dirty ? "border-primary/30" : "border-border/50",
                  !d.isActive && "opacity-80",
                )}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      ID · {c.id}
                    </p>
                    <p className="font-serif text-lg font-semibold tracking-tight">
                      {d.name || c.name}
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      checked={d.isActive}
                      onChange={(e) =>
                        updateDraft(c.id, { isActive: e.target.checked })
                      }
                    />
                    Tampil di toko
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${c.id}`}>Nama tampilan</Label>
                    <Input
                      id={`name-${c.id}`}
                      value={d.name}
                      onChange={(e) =>
                        updateDraft(c.id, { name: e.target.value })
                      }
                      maxLength={40}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`sort-${c.id}`}>Urutan</Label>
                    <Input
                      id={`sort-${c.id}`}
                      type="number"
                      value={d.sortOrder}
                      onChange={(e) =>
                        updateDraft(c.id, {
                          sortOrder: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`desc-${c.id}`}>Deskripsi</Label>
                    <Textarea
                      id={`desc-${c.id}`}
                      value={d.description}
                      onChange={(e) =>
                        updateDraft(c.id, { description: e.target.value })
                      }
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`icon-${c.id}`}>Ikon (emoji, opsional)</Label>
                    <Input
                      id={`icon-${c.id}`}
                      value={d.icon}
                      onChange={(e) =>
                        updateDraft(c.id, { icon: e.target.value })
                      }
                      maxLength={8}
                      placeholder="opsional"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!dirty || busy || !d.name.trim()}
                    onClick={() => void save(c.id)}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Simpan
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
