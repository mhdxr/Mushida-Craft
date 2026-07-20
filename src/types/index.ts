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
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
  avatar: string;
  rating: number;
}

export interface CustomOrderForm {
  name: string;
  whatsapp: string;
  bouquetType: string;
  budget: string;
  neededDate: string;
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
