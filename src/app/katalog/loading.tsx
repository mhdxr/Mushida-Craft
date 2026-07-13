export default function CatalogLoading() {
  return (
    <div className="container py-10 md:py-14">
      {/* Heading skeleton */}
      <div className="mb-10 max-w-2xl space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <div className="h-11 animate-pulse rounded-xl bg-secondary" />
        <div className="h-11 animate-pulse rounded-xl bg-secondary" />
        <div className="h-11 animate-pulse rounded-xl bg-secondary" />
      </div>

      {/* Product card skeletons */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
          >
            <div className="aspect-[4/5] animate-pulse bg-secondary" />
            <div className="space-y-2 p-4">
              <div className="h-2.5 w-16 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
