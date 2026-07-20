import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /**
   * Variasi ukuran tampilan.
   * - sm: navbar (tinggi ~28–32px)
   * - md: footer (tinggi ~32–36px)
   */
  size?: "sm" | "md";
  className?: string;
  /** Jika true, logo dibungkus Link ke beranda. */
  asLink?: boolean;
  priority?: boolean;
}

// Dimensi intrinsik public/images/logo-wordmark.png
const LOGO_WIDTH = 640;
const LOGO_HEIGHT = 158;

/**
 * Logo wordmark Mushida_Craft dari public/images/.
 *
 * - logo-wordmark.png → gelap (untuk UI light: navbar/footer)
 * - logo-wordmark-light.png → terang (untuk dark bg)
 * - mushida-craft-logo.png → file sumber PNG asli
 *
 * Constraint CSS mencegah wordmark meledak di layout.
 */
export function BrandLogo({
  size = "sm",
  className,
  asLink = true,
  priority = false,
}: BrandLogoProps) {
  const sizeClass =
    size === "md"
      ? "h-8 w-auto max-w-[10.5rem] sm:h-9 sm:max-w-[12rem]"
      : "h-7 w-auto max-w-[9rem] sm:h-8 sm:max-w-[10.5rem]";

  const image = (
    <Image
      src="/images/logo-wordmark.png"
      alt="Mushida Craft"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      sizes="(max-width: 640px) 144px, 168px"
      className={cn(
        "block object-contain object-left",
        sizeClass,
        className,
      )}
    />
  );

  if (!asLink) return image;

  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center"
      aria-label="Mushida Craft — Beranda"
    >
      {image}
    </Link>
  );
}
