import { AdminProducts } from "@/components/admin/admin-products";

export const metadata = {
  title: "Admin · Produk",
  robots: { index: false, follow: false },
};

export default function AdminProdukPage() {
  return <AdminProducts />;
}
