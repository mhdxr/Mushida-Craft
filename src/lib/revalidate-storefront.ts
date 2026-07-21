import { revalidatePath } from "next/cache";

/** Invalidate cache halaman publik setelah mutate produk. */
export function revalidateStorefront(productSlug?: string | null) {
  try {
    revalidatePath("/");
    revalidatePath("/katalog");
    revalidatePath("/sitemap.xml");
    if (productSlug) {
      revalidatePath(`/produk/${productSlug}`);
    }
  } catch {
    // ignore di env tanpa Next cache
  }
}