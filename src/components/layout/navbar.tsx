"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <BrandLogo size="sm" priority />

        <nav className="hidden min-w-0 items-center gap-6 lg:gap-8 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
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
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-white md:hidden">
          <div className="container flex flex-col gap-2 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
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
      )}
    </header>
  );
}
