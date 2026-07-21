import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** Heading section statis (tanpa Framer) agar selalu terlihat & ringan. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-[2rem] font-medium leading-[1.18] md:text-[2.5rem]">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-[0.95rem] leading-[1.7] text-muted-foreground md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
