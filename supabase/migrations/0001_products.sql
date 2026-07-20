-- ===========================================================================
-- Mushida-Craft: Products table + RLS + seed data
-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- atau otomatis via: npm run db:setup
--
-- Kategori produksi:
--   snack-bouquet, money-bouquet, artificial-bouquet, graduation-bouquet, satin-flower
-- ===========================================================================

-- 0. Drop tabel lama jika ada dengan struktur berbeda ------------------------
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

drop policy if exists "Public dapat membaca produk" on public.products;
create policy "Public dapat membaca produk"
  on public.products
  for select
  using (true);

-- 3. Seed data (10 produk — 5 kategori produksi) -----------------------------
insert into public.products (id, slug, name, description, price, category, images, badge, is_available, created_at)
values
  ('p01', 'snack-bouquet-choco-delight', 'Snack Bouquet Choco Delight', 'Buket snack berisi aneka coklat premium dan camilan favorit, dibungkus rapi dengan ribbon saten. Cocok untuk ulang tahun dan kejutan teman.', 185000, 'snack-bouquet', array['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=900&q=80','https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=900&q=80'], 'best-seller', true, '2025-03-01'),
  ('p02', 'money-bouquet-fortune', 'Money Bouquet Fortune', 'Bouquet uang kreatif berisi pecahan rupiah dipadu aksen bunga artifisial premium. Bisa custom nominal sesuai kebutuhan.', 650000, 'money-bouquet', array['https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80','https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80'], 'new', true, '2025-04-10'),
  ('p03', 'artificial-rose-blush', 'Artificial Rose Blush', 'Buket mawar artifisial nuansa blush pink dengan greenery, awet bertahun-tahun tanpa layu. Ideal untuk dekor kamar dan hadiah long-lasting.', 225000, 'artificial-bouquet', array['https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=80','https://images.unsplash.com/photo-1457089328389-e5d62b8c4d10?w=900&q=80'], 'best-seller', true, '2025-03-15'),
  ('p04', 'graduation-sunshine', 'Graduation Sunshine', 'Bouquet wisuda ceria dengan aksen sunflower dan boneka mini graduation. Hadiah penuh semangat untuk merayakan kelulusan.', 235000, 'graduation-bouquet', array['https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80','https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=80'], 'best-seller', true, '2025-03-01'),
  ('p05', 'satin-peony-elegance', 'Satin Peony Elegance', 'Bunga peony satin handmade dengan detail rapi dan warna soft pastel. Tahan lama, cocok untuk kado spesial dan dekor meja.', 195000, 'satin-flower', array['https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80','https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80'], 'new', true, '2025-05-02'),
  ('p06', 'snack-bouquet-party-mix', 'Snack Bouquet Party Mix', 'Mix snack favorit (keripik, permen, coklat) dalam susunan buket meriah. Bisa request brand camilan sesuai selera penerima.', 165000, 'snack-bouquet', array['https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=900&q=80','https://images.unsplash.com/photo-1548907040-4baa42d10919?w=900&q=80'], null, true, '2025-04-18'),
  ('p07', 'money-bouquet-mini', 'Money Bouquet Mini', 'Bouquet uang ukuran mini dengan nominal mulai Rp200.000. Cocok sebagai hadiah ulang tahun dan kado kejutan.', 350000, 'money-bouquet', array['https://images.unsplash.com/photo-1612966769205-a3d76dffa7e8?w=900&q=80','https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80'], null, true, '2025-04-18'),
  ('p08', 'artificial-lavender-dream', 'Artificial Lavender Dream', 'Buket lavender artifisial nuansa ungu pastel dengan dusty miller. Estetika soft yang cocok untuk hadiah romantis.', 245000, 'artificial-bouquet', array['https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&q=80','https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=900&q=80'], null, true, '2025-02-28'),
  ('p09', 'graduation-pastel-bliss', 'Graduation Pastel Bliss', 'Bouquet wisuda nuansa pastel pink dan cream dengan boneka mini graduation. Tersedia ukuran medium dan jumbo.', 285000, 'graduation-bouquet', array['https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80','https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80'], 'new', true, '2025-03-22'),
  ('p10', 'satin-rose-classic', 'Satin Rose Classic', 'Mawar satin klasik warna merah & cream, dirangkai rapi dengan wrapping premium. Hadiah timeless yang tidak layu.', 210000, 'satin-flower', array['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80','https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80'], 'best-seller', true, '2025-05-10')
;
