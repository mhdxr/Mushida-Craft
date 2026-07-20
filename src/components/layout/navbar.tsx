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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <BrandLogo size="sm" priority />

        <nav className="hidden min-w-0 items-center gap-6 lg:gap-8 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" &&
                !link.href.startsWith("/#") &&
                pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex">
          <Button asChild size="sm">
            <Link href="/katalog">Belanja Sekarang</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls={menuId}
          className="relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-white text-foreground shadow-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Panel mobile: fixed full-width agar selalu di atas konten. */}
      <div
        id={menuId}
        hidden={!open}
        className={cn(
          "border-t border-border/60 bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="container flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm" className="mt-2">
            <Link href="/katalog" onClick={() => setOpen(false)}>
              Belanja Sekarang
            </Link>
          </Button>
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
