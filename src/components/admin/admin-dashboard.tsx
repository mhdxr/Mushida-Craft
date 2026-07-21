"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";
import { ProductTable } from "@/components/admin/product-table";
import { TestimonialModeration } from "@/components/admin/testimonial-moderation";
import { useProducts } from "@/hooks/use-products";
import { toast } from "@/hooks/use-toast";
import { getTimeGreetingWithName } from "@/lib/greeting";
import type { Product } from "@/types";

export function AdminDashboard() {
  const router = useRouter();
  const {
    products,
    isLoading,
    create,
    update,
    remove,
    reset,
    uploadImages,
  } = useProducts();
  const [authChecked, setAuthChecked] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [resetting, setResetting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const json = await res.json();
        setAdminEmail(json.email ?? "");
        setAuthChecked(true);
      } catch {
        // Gagal cek sesi (mis. jaringan) → arahkan ke login daripada
        // stuck di layar "Memuat dashboard..." selamanya.
        router.replace("/admin/login");
      }
    })();
  }, [router]);

  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm, editing?.id]);

  if (!authChecked) {
    return (
      <div className="container py-10 md:py-12" aria-busy="true">
        <div className="mb-8 space-y-3">
          <div className="h-3 w-28 animate-pulse rounded bg-secondary" />
          <div className="h-9 w-56 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
        </div>
        <div className="h-48 animate-pulse rounded-2xl border border-border/50 bg-white" />
      </div>
    );
  }

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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch {
      toast.error("Gagal logout. Coba lagi.");
      setLoggingOut(false);
    }
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

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      await remove(p.id);
      toast.success(`"${p.name}" dihapus.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menghapus produk.",
      );
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Reset data ke seed default? Semua perubahan produk akan hilang.",
      )
    )
      return;
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

  return (
    <div className="container py-10 md:py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Admin
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Kelola toko
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getTimeGreetingWithName(adminEmail || undefined)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            Reset data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Logout
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah produk
          </Button>
        </div>
      </div>

      {showForm && (
        <div
          ref={formRef}
          className="mb-8 scroll-mt-24 rounded-2xl border border-border/50 bg-white p-6 shadow-sm md:p-8"
        >
          <h2 className="mb-4 font-serif text-lg font-semibold tracking-tight">
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

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              Produk
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Memuat..."
                : `${products.length} produk di katalog`}
            </p>
          </div>
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
            products={products}
            onEdit={openEdit}
            onDelete={handleDelete}
            onCreate={openCreate}
          />
        )}
      </section>

      <TestimonialModeration />
    </div>
  );
}
