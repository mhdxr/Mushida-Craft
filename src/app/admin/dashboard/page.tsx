import { redirect } from "next/navigation";

/** Alias lama → ringkasan admin baru. */
export default function AdminDashboardRedirect() {
  redirect("/admin");
}
