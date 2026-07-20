"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";
import {
  productFormSchema,
  type ProductFormSchema,
} from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { Product, ProductBadge, ProductCategory } from "@/types";

// Radix Select tidak mengizinkan empty string sebagai value,
// jadi kita pakai sentinel "none" untuk merepresentasikan "tanpa badge".
const NO_BADGE = "none";

interface ProductFormProps {
  initial?: Product;
  onSubmit: (data: Omit<Product, "id" | "createdAt"> | Partial<Product>) => Promise<void>;
  onCancel: () => void;
  uploadImages: (files: File[]) => Promise<string[]>;
}

export function ProductForm({
  initial,
  onSubmit,
  onCancel,
  uploadImages,
}: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      price: initial?.price ?? 0,
      category: initial?.category ?? "graduation",
      images: initial?.images.join("\n") ?? "",
      badge: (initial?.badge ?? "") as ProductFormSchema["badge"],
      isAvailable: initial?.isAvailable ?? true,
    },
  });

  useEffect(() => {
    const nextImages = initial?.images ?? [];
    setImages(nextImages);
    reset({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      price: initial?.price ?? 0,
      category: initial?.category ?? "graduation",
      images: nextImages.join("\n"),
      badge: (initial?.badge ?? "") as ProductFormSchema["badge"],
      isAvailable: initial?.isAvailable ?? true,
    });
  }, [initial, reset]);

  const category = watch("category");
  const badge = watch("badge");
  const isAvailable = watch("isAvailable");

  const handleImagesChange = (nextImages: string[]) => {
    setImages(nextImages);
    setValue("images", nextImages.join("\n"), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handle = handleSubmit(async (data) => {
    if (isUploadingImages) return;
    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: data.category,
      images,
      badge: !data.badge ? undefined : (data.badge as ProductBadge),
      isAvailable: data.isAvailable,
      slug: initial?.slug ?? slugify(data.name),
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={handle} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nama produk</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input
            id="price"
            type="number"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select
            value={category}
            onValueChange={(v) =>
              setValue("category", v as ProductCategory, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Badge</Label>
          <Select
            value={badge || NO_BADGE}
            onValueChange={(v) =>
              setValue(
                "badge",
                (v === NO_BADGE ? "" : v) as ProductBadge | "",
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tanpa badge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_BADGE}>Tanpa badge</SelectItem>
              <SelectItem value="best-seller">Best Seller</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="sold-out">Sold Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex h-11 items-center gap-3 rounded-xl border border-input bg-background px-4">
            <input
              id="isAvailable"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) =>
                setValue("isAvailable", e.target.checked, {
                  shouldValidate: true,
                })
              }
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label htmlFor="isAvailable" className="text-sm">
              Tersedia / aktif
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <input type="hidden" {...register("images")} />
          <ProductImageManager
            images={images}
            onChange={handleImagesChange}
            onUpload={uploadImages}
            onUploadingChange={setIsUploadingImages}
            disabled={isSubmitting}
            error={errors.images?.message}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" rows={5} {...register("description")} />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isUploadingImages}
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploadingImages}>
          <Save className="h-4 w-4" />
          {initial ? "Update produk" : "Simpan produk"}
        </Button>
      </div>
    </form>
  );
}
