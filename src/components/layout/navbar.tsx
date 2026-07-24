"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/katalog", label: "Katalog" },
  { href: "/custom-order", label: "Custom" },
  { href: "/#testimoni", label: "Testimoni" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
    <header className="sticky top-0 z-50 isolate w-full border-b border-blush-100/30 bg-white/70 backdrop-blur-md shadow-[0_4px_24px_-8px_rgba(255,196,213,0.08)]">
      <div className="container relative z-[60] flex h-[4.25rem] items-center justify-between gap-6">
        <BrandLogo size="sm" priority />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-[13px] tracking-wide transition-colors",
                isActive(link.href)
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span
                  aria-hidden
                  className="absolute inset-x-4 -bottom-0.5 mx-auto h-px bg-primary/70"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-primary/25 bg-white/80 px-5 text-[13px] tracking-wide hover:border-primary/40 hover:bg-blush-50"
          >
            <Link href="/katalog">Lihat Katalog</Link>
          </Button>
        </div>

        {/* z tinggi + di atas overlay — pastikan selalu bisa diklik di mobile */}
        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls={menuId}
          className="relative z-[70] inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/50 bg-white text-foreground shadow-sm transition-transform active:scale-95 md:hidden"
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

      {/* Overlay hanya di-mount saat open — hindari layer tak terlihat menahan klik */}
      {open ? (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[4.25rem] z-[55] bg-foreground/15 backdrop-blur-sm md:hidden"
          />

          <div
            id={menuId}
            className="absolute inset-x-0 top-full z-[56] origin-top border-b border-border/40 bg-white/95 shadow-xl shadow-primary/5 backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col gap-1 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3.5 text-sm tracking-wide transition-colors",
                    isActive(link.href)
                      ? "bg-blush-50 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-3">
                <Button asChild className="w-full tracking-wide">
                  <Link href="/katalog" onClick={() => setOpen(false)}>
                    Lihat Katalog
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}

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
              Lihat Katalog
            </a>
          </div>
        </nav>
      </noscript>
    </header>
  );
}
