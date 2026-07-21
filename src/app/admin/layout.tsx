"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Layout /admin/* — login tanpa shell; halaman lain pakai AdminShell.
 * Chrome toko publik disembunyikan via StoreChrome di root layout.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isLogin =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f5] px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
