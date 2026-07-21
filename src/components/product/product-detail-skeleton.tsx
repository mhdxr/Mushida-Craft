/** Skeleton PDP — dipakai loading.tsx dan fallback client fetch. */
export function ProductDetailSkeleton() {
  return (
    <div className="container py-10 md:py-14" aria-busy="true">
      <div className="h-4 w-36 animate-pulse rounded bg-secondary" />
      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="space-y-3">
          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-secondary/70" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-secondary/60"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
          <div className="h-9 w-4/5 animate-pulse rounded bg-secondary" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-secondary" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-secondary" />
          </div>
          <div className="h-px w-full bg-border/50" />
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
          <div className="h-28 w-full animate-pulse rounded-2xl bg-secondary/50" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-12 w-full animate-pulse rounded-full bg-secondary sm:w-48" />
            <div className="h-12 w-full animate-pulse rounded-full bg-secondary sm:w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
