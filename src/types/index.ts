export type ProductCategory =
  | "snack-bouquet"
  | "money-bouquet"
  | "artificial-bouquet"
  | "graduation-bouquet"
  | "satin-flower";

export type ProductBadge = "best-seller" | "new" | "sold-out";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  badge?: ProductBadge | null;
  isAvailable: boolean;
  createdAt: string;
  /** ISO date/time last modified — optional for seed/legacy rows. */
  updatedAt?: string;
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  description: string;
  icon: string;
}

export type TestimonialStatus = "pending" | "approved";

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  message: string;
  /** Optional — customer-submitted testimonials use initials when missing. */
  avatar?: string;
  rating: number;
  status?: TestimonialStatus;
  createdAt?: string;
}

export interface CustomOrderForm {
  name: string;
  whatsapp: string;
  bouquetType: string;
  budget: string;
  neededDate: string;
  /** Momen / occasion, mis. Ulang tahun, Wisuda. */
  occasion: string;
  /** Area tujuan pengiriman. */
  deliveryArea: string;
  notes?: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string;
  badge?: ProductBadge | "";
  isAvailable: boolean;
}
