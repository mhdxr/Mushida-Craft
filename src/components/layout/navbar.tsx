"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/custom-order", label: "Custom Order" },
  { href: "/#testimoni", label: "Testimoni" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Tutup menu saat route berubah.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Tutup menu saat Escape ditekan.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Kunci scroll body saat menu mobile terbuka.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/" && !href.startsWith("/#") && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <BrandLogo size="sm" priority />

        <nav className="hidden min-w-0 items-center gap-6 lg:gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Button asChild size="sm">
            <Link href="/katalog">Belanja Sekarang</Link>
          </Button>
        </div>

        {/* Hit target ≥ 44×44; ikon Menu/X cross-fade + rotate. */}
        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls={menuId}
          className="relative z-50 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-white text-foreground shadow-sm transition-transform active:scale-95 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu
            aria-hidden
            className={cn(
              "absolute h-5 w-5 transition-all duration-300 ease-out motion-reduce:transition-none",
              open
                ? "rotate-90 scale-75 opacity-0"
                : "rotate-0 scale-100 opacity-100",
            )}
          />
          <X
            aria-hidden
            className={cn(
              "absolute h-5 w-5 transition-all duration-300 ease-out motion-reduce:transition-none",
              open
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-75 opacity-0",
            )}
          />
        </button>
      </div>

      {/* Backdrop: selalu ter-mount, fade + blur; klik menutup menu. */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 top-16 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 ease-out md:hidden motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Panel: selalu ter-mount — fade + slide-down + scale (bukan unmount). */}
      <div
        id={menuId}
        className={cn(
          "absolute inset-x-0 top-16 z-40 origin-top border-b border-border/60 bg-white shadow-lg transition-all duration-300 ease-out md:hidden motion-reduce:transition-none motion-reduce:duration-0",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-3 scale-[0.98] opacity-0",
        )}
      >
        <div className="container flex flex-col gap-1 py-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                transitionDelay: open ? `${80 + i * 45}ms` : "0ms",
              }}
              className={cn(
                "rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:delay-0",
                open
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0",
                isActive(link.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div
            style={{
              transitionDelay: open
                ? `${80 + navLinks.length * 45}ms`
                : "0ms",
            }}
            className={cn(
              "mt-2 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:delay-0",
              open
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0",
            )}
          >
            <Button asChild size="sm" className="w-full">
              <Link href="/katalog" onClick={() => setOpen(false)}>
                Belanja Sekarang
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Fallback navigasi tanpa JS (SEO + HP dengan script gagal). */}
      <noscript>
        <nav className="border-t border-border/60 bg-white md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/katalog"
              className="mt-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Belanja Sekarang
            </a>
          </div>
        </nav>
      </noscript>
    </header>
  );
}
