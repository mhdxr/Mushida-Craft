import { AdminCategories } from "@/components/admin/admin-categories";

export const metadata = {
  title: "Admin · Kategori",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}
