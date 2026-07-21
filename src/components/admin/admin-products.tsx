"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, RotateCcw, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProductForm } from "@/components/admin/product-form";
import { ProductTable } from "@/components/admin/product-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";
import { useProducts } from "@/hooks/use-products";
import { toast } from "@/hooks/use-toast";
import type { Product, ProductCategory } from "@/types";

export function AdminProducts() {
  const {
    products,
    isLoading,
    create,
    update,
    remove,
    reset,
    uploadImages,
  } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm, editing?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, search, category]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleCreate = async (
    data: Omit<Product, "id" | "createdAt"> | Partial<Product>,
  ) => {
    try {
      await create(data as Omit<Product, "id" | "createdAt">);
      closeForm();
      toast.success("Produk berhasil ditambahkan.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menambahkan produk.",
      );
    }
  };

  const handleUpdate = async (
    data: Omit<Product, "id" | "createdAt"> | Partial<Product>,
  ) => {
    if (!editing) return;
    try {
      await update(editing.id, data as Partial<Product>);
      closeForm();
      toast.success("Produk berhasil diperbarui.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui produk.",
      );
    }
  };

  const handleDeleteRequest = (p: Product) => {
    setDeleteTarget(p);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menghapus produk.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleAvailable = async (p: Product, next: boolean) => {
    try {
      await update(p.id, { isAvailable: next });
      toast.success(
        next ? `"${p.name}" diaktifkan.` : `"${p.name}" dinonaktifkan.`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengubah status stok.",
      );
      throw err;
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Reset data ke seed default? Semua perubahan produk akan hilang.",
      )
    )
      return;
    // Konfirmasi ketik di production-like — API juga memblokir NODE_ENV=production.
    if (process.env.NODE_ENV === "production") {
      toast.error("Reset seed dinonaktifkan di production.");
      return;
    }
    setResetting(true);
    try {
      await reset();
      toast.success("Data produk direset ke seed default.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mereset data produk.",
      );
    } finally {
      setResetting(false);
    }
  };

  const showReset = process.env.NODE_ENV !== "production";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            Katalog
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Produk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Memuat..."
              : `${products.length} produk · menampilkan ${filtered.length}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showReset ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={resetting || isLoading}
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Reset seed
            </Button>
          ) : null}
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah produk
          </Button>
        </div>
      </div>

      {showForm && (
        <div
          ref={formRef}
          className="scroll-mt-24 rounded-2xl border border-border/50 bg-white p-5 shadow-sm md:p-6"
        >
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            {editing ? "Edit produk" : "Tambah produk baru"}
          </h2>
          <ProductForm
            key={editing?.id ?? "new-product"}
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            uploadImages={uploadImages}
            onCancel={closeForm}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau deskripsi..."
            className="h-10 border-border/60 bg-secondary/20 pl-9"
            aria-label="Cari produk"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as ProductCategory | "all")}
        >
          <SelectTrigger
            className="h-10 w-full border-border/60 sm:w-48"
            aria-label="Filter kategori"
          >
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3 rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 animate-pulse rounded bg-secondary" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProductTable
          products={filtered}
          onEdit={openEdit}
          onDelete={handleDeleteRequest}
          onCreate={openCreate}
          onToggleAvailable={handleToggleAvailable}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Hapus produk?"
        description={
          deleteTarget
            ? `Produk “${deleteTarget.name}” akan dihapus permanen, termasuk gambar di storage bila ada.`
            : ""
        }
        confirmLabel="Hapus"
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
