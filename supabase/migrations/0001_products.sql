-- ===========================================================================
-- Mushida-Craft: Products table + RLS + seed data
-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- atau otomatis via: npm run db:setup
--
-- Kategori produksi: graduation, money-bouquet
-- (hand-bouquet / wedding / anniversary / dried-flower dihapus)
-- ===========================================================================

-- 0. Drop tabel lama jika ada dengan struktur berbeda ------------------------
-- (Idempotent: drop semua dependent objects lalu recreate)
drop table if exists public.products cascade;
drop type if exists public.badge_type cascade;

-- 1. Tabel products ---------------------------------------------------------
create table public.products (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  description text not null,
  price       integer not null,
  category    text not null,
  images      text[] not null default '{}',
  badge       text,
  is_available boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- 2. Row Level Security ------------------------------------------------------
alter table public.products enable row level security;

-- Public bisa SELECT semua produk (anon key).
drop policy if exists "Public dapat membaca produk" on public.products;
create policy "Public dapat membaca produk"
  on public.products
  for select
  using (true);

-- Hanya service_role yang bisa INSERT/UPDATE/DELETE.
-- (service_role bypass RLS secara default, jadi tidak perlu policy tambahan.)

-- 3. Seed data (6 produk — graduation & money-bouquet) -----------------------
insert into public.products (id, slug, name, description, price, category, images, badge, is_available, created_at)
values
  ('p03', 'graduation-sunshine', 'Graduation Sunshine', 'Bouquet wisuda ceria dengan kombinasi sunflower, baby yellow rose, dan daun salal. Hadiah penuh semangat untuk merayakan kelulusan tersayang.', 235000, 'graduation', array['https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80','https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=80'], 'best-seller', true, '2025-03-01'),
  ('p05', 'money-bouquet-fortune', 'Money Bouquet Fortune', 'Bouquet uang kreatif berisi pecahan rupiah hingga Rp500.000 dipadu mawar artificial premium. Bisa custom nominal sesuai kebutuhan.', 650000, 'money-bouquet', array['https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80','https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80'], 'new', true, '2025-04-10'),
  ('p09', 'graduation-pastel-bliss', 'Graduation Pastel Bliss', 'Bouquet wisuda nuansa pastel pink dan cream dengan boneka mini graduation. Tersedia dalam ukuran medium dan jumbo.', 285000, 'graduation', array['https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80','https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80'], 'best-seller', true, '2025-03-22'),
  ('p11', 'money-bouquet-mini', 'Money Bouquet Mini', 'Bouquet uang ukuran mini dengan nominal mulai Rp200.000. Cocok sebagai hadiah ulang tahun dan kado kejutan teman.', 350000, 'money-bouquet', array['https://images.unsplash.com/photo-1612966769205-a3d76dffa7e8?w=900&q=80','https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80'], null, true, '2025-04-18'),
  ('p13', 'graduation-elegant-white', 'Graduation Elegant White', 'Bouquet wisuda elegan putih-cream dengan mawar putih, lisianthus, dan eucalyptus. Cocok untuk foto wisuda formal.', 275000, 'graduation', array['https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=80','https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80'], 'new', true, '2025-05-02'),
  ('p14', 'money-bouquet-premium', 'Money Bouquet Premium', 'Bouquet uang premium ukuran jumbo, bisa custom nominal hingga jutaan. Packaging mewah dengan ribbon satin dan kartu ucapan.', 950000, 'money-bouquet', array['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80','https://images.unsplash.com/photo-1612966769205-a3d76dffa7e8?w=900&q=80'], 'best-seller', true, '2025-05-10')
;
