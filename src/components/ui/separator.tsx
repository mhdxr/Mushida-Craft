import * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
};

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, decorative = true, orientation = "horizontal", ...props },
    ref,
  ) => {
    const semanticProps = decorative
      ? { "aria-hidden": true }
      : { "aria-orientation": orientation, role: "separator" };

    return (
      <div
        ref={ref}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className,
        )}
        {...semanticProps}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

export { Separator };
