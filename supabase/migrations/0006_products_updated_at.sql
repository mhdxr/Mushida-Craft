-- ===========================================================================
-- Mushida-Craft: products.updated_at untuk sitemap / cache freshness
-- ===========================================================================

alter table public.products
  add column if not exists updated_at timestamptz not null default now();

-- Backfill: produk lama = created_at (bukan "baru diedit hari ini").
update public.products
set updated_at = coalesce(created_at, now())
where updated_at is null
   or updated_at = created_at
   or updated_at < created_at;

comment on column public.products.updated_at is
  'Terakhir diubah. Dipakai sitemap lastmod & revalidate freshness.';

-- Trigger: setiap UPDATE baris otomatis set updated_at = now().
create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_products_updated_at();
