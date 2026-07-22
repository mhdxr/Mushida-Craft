-- ===========================================================================
-- Mushida-Craft: tabel categories (metadata; id slug = ProductCategory)
-- Tabel lama (cuid + slug camelCase) diganti — tidak ada FK ke products.
-- Public SELECT; write lewat service role (admin API).
-- ===========================================================================

-- Drop skema lama bila ada (id cuid, kolom camelCase, slug terpisah).
drop table if exists public.categories cascade;

create table public.categories (
  id          text primary key
                check (id in (
                  'snack-bouquet',
                  'money-bouquet',
                  'artificial-bouquet',
                  'graduation-bouquet',
                  'satin-flower'
                )),
  name        text not null,
  description text not null default '',
  icon        text not null default '',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists idx_categories_sort
  on public.categories (sort_order asc, name asc);

alter table public.categories enable row level security;

drop policy if exists "Public dapat membaca kategori" on public.categories;
create policy "Public dapat membaca kategori"
  on public.categories
  for select
  using (true);

insert into public.categories (id, name, description, icon, sort_order, is_active)
values
  (
    'snack-bouquet',
    'Snack',
    'Rangkaian camilan kreatif untuk hadiah seru dan berkesan.',
    '🍫',
    10,
    true
  ),
  (
    'money-bouquet',
    'Money',
    'Rangkaian uang unik, bisa custom nominal sesuai budget.',
    '💸',
    20,
    true
  ),
  (
    'artificial-bouquet',
    'Artifisial',
    'Bunga artifisial premium yang awet dan tetap cantik.',
    '🌺',
    30,
    true
  ),
  (
    'graduation-bouquet',
    'Graduation',
    'Rangkaian spesial untuk merayakan momen wisuda.',
    '🎓',
    40,
    true
  ),
  (
    'satin-flower',
    'Satin',
    'Bunga satin handmade elegan, tahan lama & mewah.',
    '🎀',
    50,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

comment on table public.categories is
  'Metadata kategori katalog. ID slug fixed agar cocok dengan products.category + Zod.';
