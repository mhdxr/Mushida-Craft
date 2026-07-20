"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      // Konten tetap visible tanpa JS/hydration — jangan start opacity 0.
      initial={reduceMotion ? false : { opacity: 1, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-base text-muted-foreground">{description}</p>
      )}
    </motion.div>
  );
}
