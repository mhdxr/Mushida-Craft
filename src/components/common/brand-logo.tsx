import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Tinggi logo dalam pixel (default 36). */
  height?: number;
  className?: string;
  /** Jika true, logo dibungkus Link ke beranda. */
  asLink?: boolean;
  priority?: boolean;
}

/**
 * Logo wordmark Mushida_Craft (daisy di huruf i).
 * Dipakai di navbar & footer.
 */
export function BrandLogo({
  height = 36,
  className,
  asLink = true,
  priority = false,
}: BrandLogoProps) {
  // Aspect ratio wordmark setelah trim ≈ 1178×261 ≈ 4.51:1
  const width = Math.round(height * 4.51);

  const image = (
    <Image
      src="/logo.png"
      alt="Mushida Craft"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );

  if (!asLink) return image;

  return (
    <Link
      href="/"
      className="inline-flex items-center"
      aria-label="Mushida Craft — Beranda"
    >
      {image}
    </Link>
  );
}
