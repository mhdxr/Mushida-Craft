"use client";

import Image from "next/image";
import { useState, type DragEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Link2,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_IMAGE_FILE_SIZE,
  MAX_PRODUCT_IMAGES,
  isProductImageMimeType,
} from "@/lib/product-images";
import { productImageSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface ProductImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (files: File[]) => Promise<string[]>;
  onUploadingChange: (isUploading: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export function ProductImageManager({
  images,
  onChange,
  onUpload,
  onUploadingChange,
  disabled = false,
  error,
}: ProductImageManagerProps) {
  const [urlInput, setUrlInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const controlsDisabled = disabled || isUploading;

  const handleFiles = async (files: File[]) => {
    setLocalError(null);
    if (files.length === 0) return;

    if (images.length + files.length > MAX_PRODUCT_IMAGES) {
      setLocalError(`Maksimal ${MAX_PRODUCT_IMAGES} gambar per produk.`);
      return;
    }

    for (const [index, file] of files.entries()) {
      if (!isProductImageMimeType(file.type)) {
        setLocalError(
          `File ke-${index + 1} harus berformat JPEG, PNG, WebP, atau AVIF.`,
        );
        return;
      }
      if (file.size === 0) {
        setLocalError(`File ke-${index + 1} kosong.`);
        return;
      }
      if (file.size > MAX_IMAGE_FILE_SIZE) {
        setLocalError(`File ke-${index + 1} melebihi batas 5 MB.`);
        return;
      }
    }

    setIsUploading(true);
    onUploadingChange(true);
    try {
      const urls = await onUpload(files);
      onChange([...images, ...urls]);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Gagal mengunggah gambar.",
      );
    } finally {
      setIsUploading(false);
      onUploadingChange(false);
    }
  };

  const handleDropFiles = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (controlsDisabled) return;
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  const addUrls = () => {
    setLocalError(null);
    const candidates = urlInput
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    if (candidates.length === 0) {
      setLocalError("Masukkan minimal 1 URL gambar.");
      return;
    }

    const validUrls: string[] = [];
    for (const [index, candidate] of candidates.entries()) {
      const result = productImageSchema.safeParse(candidate);
      if (!result.success) {
        setLocalError(
          `Baris ${index + 1}: ${result.error.issues[0].message}`,
        );
        return;
      }
      validUrls.push(result.data);
    }

    const newUrls = validUrls.filter(
      (url, index) =>
        !images.includes(url) && validUrls.indexOf(url) === index,
    );
    if (newUrls.length === 0) {
      setLocalError("Semua URL tersebut sudah ada di daftar gambar.");
      return;
    }
    if (images.length + newUrls.length > MAX_PRODUCT_IMAGES) {
      setLocalError(`Maksimal ${MAX_PRODUCT_IMAGES} gambar per produk.`);
      return;
    }

    onChange([...images, ...newUrls]);
    setUrlInput("");
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= images.length ||
      toIndex >= images.length
    ) {
      return;
    }

    const nextImages = [...images];
    const [movedImage] = nextImages.splice(fromIndex, 1);
    if (!movedImage) return;
    nextImages.splice(toIndex, 0, movedImage);
    setLocalError(null);
    onChange(nextImages);
  };

  const handleDropImage = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    event.preventDefault();
    const transferredIndex = event.dataTransfer.getData("text/plain");
    const sourceIndex =
      draggedIndex ?? (transferredIndex ? Number(transferredIndex) : Number.NaN);
    if (Number.isInteger(sourceIndex)) moveImage(sourceIndex, targetIndex);
    setDraggedIndex(null);
  };

  const removeImage = (index: number) => {
    setLocalError(null);
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium">Gambar produk</p>
          <p className="text-xs text-muted-foreground">
            Maksimal {MAX_PRODUCT_IMAGES} gambar. Urutan pertama menjadi gambar utama.
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {images.length}/{MAX_PRODUCT_IMAGES}
        </span>
      </div>

      <Tabs defaultValue="device">
        <TabsList>
          <TabsTrigger value="device">
            <Upload className="h-4 w-4" />
            Device
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link2 className="h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="device">
          <label
            htmlFor="product-image-files"
            onDragEnter={(event) => {
              event.preventDefault();
              if (!controlsDisabled) setIsDraggingFiles(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDraggingFiles(false)}
            onDrop={handleDropFiles}
            className={cn(
              "flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
              isDraggingFiles && "border-primary bg-primary/10",
              controlsDisabled && "pointer-events-none cursor-not-allowed opacity-60",
            )}
          >
            <input
              id="product-image-files"
              type="file"
              accept="image/*"
              multiple
              disabled={controlsDisabled}
              className="sr-only"
              onChange={(event) => {
                void handleFiles(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
            {isUploading ? (
              <>
                <Loader2 className="mb-3 h-7 w-7 animate-spin text-primary" />
                <span className="text-sm font-medium">Mengunggah gambar...</span>
              </>
            ) : (
              <>
                <ImagePlus className="mb-3 h-7 w-7 text-primary" />
                <span className="text-sm font-medium">
                  Pilih file atau seret gambar ke sini
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  JPEG, PNG, WebP, atau AVIF. Maksimal 5 MB per file.
                </span>
              </>
            )}
          </label>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <Textarea
            rows={3}
            value={urlInput}
            disabled={controlsDisabled}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="https://...&#10;https://..."
            aria-label="URL gambar, satu per baris"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={controlsDisabled}
            onClick={addUrls}
          >
            <ImagePlus className="h-4 w-4" />
            Tambah URL
          </Button>
        </TabsContent>
      </Tabs>

      {(localError || error) && (
        <p role="alert" className="text-xs text-destructive">
          {localError || error}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              draggable={!controlsDisabled}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
                setDraggedIndex(index);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => handleDropImage(event, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={cn(
                "overflow-hidden rounded-xl border border-border bg-background",
                draggedIndex === index && "opacity-50",
              )}
            >
              <div className="relative aspect-square bg-secondary">
                <Image
                  src={image}
                  alt={`Preview gambar ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 160px"
                  className="object-cover"
                  draggable={false}
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
                  {index === 0 ? "Utama" : index + 1}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  disabled={controlsDisabled}
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 h-7 w-7"
                  aria-label={`Hapus gambar ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center justify-between gap-1 p-2">
                <GripVertical
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-label="Seret untuk mengurutkan"
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={controlsDisabled || index === 0}
                    onClick={() => moveImage(index, index - 1)}
                    className="h-7 w-7"
                    aria-label={`Geser gambar ${index + 1} ke kiri`}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={controlsDisabled || index === images.length - 1}
                    onClick={() => moveImage(index, index + 1)}
                    className="h-7 w-7"
                    aria-label={`Geser gambar ${index + 1} ke kanan`}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={controlsDisabled}
                      onClick={() => moveImage(index, 0)}
                      className="h-7 w-7 text-primary"
                      title="Jadikan gambar utama"
                      aria-label={`Jadikan gambar ${index + 1} sebagai gambar utama`}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
