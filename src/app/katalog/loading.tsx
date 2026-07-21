export default function CatalogLoading() {
  return (
    <div className="container py-10 md:py-14" aria-busy="true">
      <div className="mb-10 max-w-2xl space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
        <div className="h-9 w-3/4 max-w-md animate-pulse rounded bg-secondary" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-secondary" />
      </div>

      <div className="mb-8 space-y-4 rounded-2xl border border-border/50 bg-white p-4 shadow-sm md:p-5">
        <div className="h-11 animate-pulse rounded-full bg-secondary" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-secondary"
            />
          ))}
        </div>
        <div className="h-9 w-40 animate-pulse rounded-full bg-secondary" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-7">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm"
          >
            <div className="aspect-[4/5] animate-pulse bg-secondary/70" />
            <div className="space-y-2 px-4 py-4 md:px-5 md:py-5">
              <div className="h-2.5 w-14 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
