"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flower2,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquareQuote,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const navItems = [
  {
    href: "/admin",
    label: "Ringkasan",
    icon: LayoutDashboard,
    match: (path: string) => path === "/admin" || path === "/admin/",
  },
  {
    href: "/admin/produk",
    label: "Produk",
    icon: Package,
    match: (path: string) => path.startsWith("/admin/produk"),
  },
  {
    href: "/admin/testimoni",
    label: "Testimoni",
    icon: MessageSquareQuote,
    match: (path: string) => path.startsWith("/admin/testimoni"),
  },
  {
    href: "/admin/inquiries",
    label: "Inquiry WA",
    icon: Inbox,
    match: (path: string) => path.startsWith("/admin/inquiries"),
  },
];

/**
 * Shell console admin: sidebar desktop + top bar mobile.
 * Termasuk gate sesi — halaman anak tidak perlu cek auth ulang.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingTestimonials, setPendingTestimonials] = useState(0);
  const [newInquiries, setNewInquiries] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const json = await res.json();
        setEmail(json.email ?? "");
        setAuthChecked(true);
      } catch {
        router.replace("/admin/login");
      }
    })();
  }, [router]);

  // Badge pending testimoni di nav (ringan, refresh periodik).
  useEffect(() => {
    if (!authChecked) return;
    let active = true;
    const load = async () => {
      try {
        const [tRes, iRes] = await Promise.all([
          fetch("/api/admin/testimonials", { cache: "no-store" }),
          fetch("/api/admin/inquiries?count=new", { cache: "no-store" }),
        ]);
        const tJson = await tRes.json().catch(() => null);
        const iJson = await iRes.json().catch(() => null);
        if (!active) return;

        if (tJson?.ok && Array.isArray(tJson.testimonials)) {
          setPendingTestimonials(
            tJson.testimonials.filter(
              (t: { status?: string }) => t.status === "pending",
            ).length,
          );
        }
        if (iJson?.ok && typeof iJson.count === "number") {
          setNewInquiries(iJson.count);
        }
      } catch {
        // ignore
      }
    };
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [authChecked, pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch {
      toast.error("Gagal logout. Coba lagi.");
      setLoggingOut(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f5]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat admin...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf7f5]">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border/50 bg-white transition-[width] duration-200 md:flex",
          sidebarOpen ? "w-56" : "w-[4.25rem]",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border/50 px-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blush-50 text-primary">
            <Flower2 className="h-4 w-4" />
          </span>
          {sidebarOpen ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                Mushida Admin
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Ops console
              </p>
            </div>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            const badgeCount =
              item.href === "/admin/testimoni"
                ? pendingTestimonials
                : item.href === "/admin/inquiries"
                  ? newInquiries
                  : 0;
            const showBadge = badgeCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-blush-50 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span className="relative shrink-0">
                  <Icon className="h-4 w-4" />
                  {showBadge && !sidebarOpen ? (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent" />
                  ) : null}
                </span>
                {sidebarOpen ? (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {showBadge ? (
                      <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-accent-foreground">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-border/50 p-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Lihat toko"
          >
            <Store className="h-4 w-4 shrink-0" />
            {sidebarOpen ? "Lihat toko" : null}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            title="Logout"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 shrink-0" />
            )}
            {sidebarOpen ? "Logout" : null}
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-muted-foreground hover:bg-secondary"
            aria-label={sidebarOpen ? "Ciutkan sidebar" : "Bentangkan sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
            {sidebarOpen ? "Ciutkan" : null}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-white/95 backdrop-blur md:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blush-50 text-primary">
                <Flower2 className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Admin</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {email || "Mushida Craft"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Toko</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border/40 px-2 py-1.5">
            {navItems.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              const badgeCount =
                item.href === "/admin/testimoni"
                  ? pendingTestimonials
                  : item.href === "/admin/inquiries"
                    ? newInquiries
                    : 0;
              const showBadge = badgeCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-blush-50 text-foreground"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {showBadge ? (
                    <span className="rounded-full bg-accent/25 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-accent-foreground">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Desktop top strip */}
        <div className="hidden h-14 items-center justify-between border-b border-border/50 bg-white/80 px-6 md:flex">
          <p className="text-sm text-muted-foreground">
            {email ? (
              <>
                Masuk sebagai{" "}
                <span className="font-medium text-foreground">{email}</span>
              </>
            ) : (
              "Mushida Craft Ops"
            )}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <Store className="h-3.5 w-3.5" />
              Buka toko
            </Link>
          </Button>
        </div>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
