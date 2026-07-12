export default function ProductLoading() {
  return (
    <div className="container py-10 md:py-14">
      <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="aspect-square animate-pulse rounded-3xl bg-secondary" />
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
          <div className="h-9 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-full animate-pulse rounded bg-secondary" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
          <div className="h-12 w-48 animate-pulse rounded-full bg-secondary" />
        </div>
      </div>
    </div>
  );
}
