import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata = {
  title: "Admin · Ringkasan",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <AdminOverview />;
}
