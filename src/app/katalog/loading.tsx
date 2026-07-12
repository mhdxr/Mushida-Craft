export default function CatalogLoading() {
  return (
    <div className="container py-10 md:py-14">
      <div className="mb-10 max-w-2xl space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
      </div>
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <div className="h-11 animate-pulse rounded-xl bg-secondary" />
        <div className="h-11 animate-pulse rounded-xl bg-secondary" />
        <div className="h-11 animate-pulse rounded-xl bg-secondary" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary"
          />
        ))}
      </div>
    </div>
  );
}
