-- ===========================================================================
-- Mushida-Craft: Products table + RLS + seed data
-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- atau otomatis via: npm run db:setup
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

-- 3. Seed data (12 produk) ---------------------------------------------------
insert into public.products (id, slug, name, description, price, category, images, badge, is_available, created_at)
values
  ('p01', 'rose-blush-classic', 'Rose Blush Classic', 'Hand bouquet klasik dengan 12 tangkai mawar pink premium, dipadukan baby breath dan eucalyptus. Dibungkus rapi dengan kertas Korean wrapping bernuansa cream dan pita satin.', 285000, 'hand-bouquet', array['https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=80','https://images.unsplash.com/photo-1457089328389-e5d62b8c4d10?w=900&q=80'], 'best-seller', true, '2025-01-04'),
  ('p02', 'white-elegance-wedding', 'White Elegance Wedding', 'Bouquet pengantin elegan berisi white roses, lisianthus, dan greenery. Sempurna untuk pernikahan bertema garden dan classic timeless.', 750000, 'wedding', array['https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=900&q=80','https://images.unsplash.com/photo-1525772764200-be829a350797?w=900&q=80'], 'new', true, '2025-02-12'),
  ('p03', 'graduation-sunshine', 'Graduation Sunshine', 'Bouquet wisuda ceria dengan kombinasi sunflower, baby yellow rose, dan daun salal. Hadiah penuh semangat untuk merayakan kelulusan tersayang.', 235000, 'graduation', array['https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80','https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=80'], 'best-seller', true, '2025-03-01'),
  ('p04', 'anniversary-rouge', 'Anniversary Rouge', 'Susunan red roses premium berukuran XL dengan aksen ranunculus dan greenery, dibungkus kertas marble. Cocok untuk anniversary dan momen romantis.', 520000, 'anniversary', array['https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=900&q=80','https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=900&q=80'], null, true, '2024-12-20'),
  ('p05', 'money-bouquet-fortune', 'Money Bouquet Fortune', 'Bouquet uang kreatif berisi pecahan rupiah hingga Rp500.000 dipadu mawar artificial premium. Bisa custom nominal sesuai kebutuhan.', 650000, 'money-bouquet', array['https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80','https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80'], 'new', true, '2025-04-10'),
  ('p06', 'dried-rustic-charm', 'Dried Rustic Charm', 'Bouquet dried flower dengan pampas grass, lavender kering, dan ruscus. Estetika rustic yang tahan hingga 1 tahun.', 320000, 'dried-flower', array['https://images.unsplash.com/photo-1561181286-d5c2c1f56ff9?w=900&q=80','https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80'], null, true, '2025-01-22'),
  ('p07', 'peach-pearl-bouquet', 'Peach Pearl Bouquet', 'Hand bouquet warna peach lembut berisi peach roses, carnation, dan eucalyptus dengan ribbon emas. Cocok untuk hadiah profesional dan personal.', 310000, 'hand-bouquet', array['https://images.unsplash.com/photo-1487070183336-b863922373d4?w=900&q=80','https://images.unsplash.com/photo-1471696035578-3d8c78d99684?w=900&q=80'], null, true, '2025-03-15'),
  ('p08', 'lavender-dream-wedding', 'Lavender Dream Wedding', 'Bouquet pengantin nuansa ungu pastel dengan lisianthus, lavender, dan dusty miller. Hadiah pengiring yang menawan untuk wedding indoor.', 820000, 'wedding', array['https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&q=80','https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=900&q=80'], null, true, '2025-02-28'),
  ('p09', 'graduation-pastel-bliss', 'Graduation Pastel Bliss', 'Bouquet wisuda nuansa pastel pink dan cream dengan boneka mini graduation. Tersedia dalam ukuran medium dan jumbo.', 285000, 'graduation', array['https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80','https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80'], 'best-seller', true, '2025-03-22'),
  ('p10', 'love-letter-anniversary', 'Love Letter Anniversary', 'Bouquet anniversary special edition dengan red & pink roses, kartu ucapan handlettering custom, serta box velvet eksklusif.', 685000, 'anniversary', array['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80','https://images.unsplash.com/photo-1525772764200-be829a350797?w=900&q=80'], 'sold-out', false, '2025-01-30'),
  ('p11', 'money-bouquet-mini', 'Money Bouquet Mini', 'Bouquet uang ukuran mini dengan nominal mulai Rp200.000. Cocok sebagai hadiah ulang tahun dan kado kejutan teman.', 350000, 'money-bouquet', array['https://images.unsplash.com/photo-1612966769205-a3d76dffa7e8?w=900&q=80','https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=900&q=80'], null, true, '2025-04-18'),
  ('p12', 'dried-pampas-elegance', 'Dried Pampas Elegance', 'Bouquet pampas premium dengan ranting kering eucalyptus dan bunga statis ungu. Long-lasting hingga lebih dari 12 bulan.', 425000, 'dried-flower', array['https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80','https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=900&q=80'], 'new', true, '2025-04-25')
;
