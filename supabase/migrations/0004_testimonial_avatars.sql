-- ===========================================================================
-- Mushida-Craft: kolom avatar untuk testimoni
-- Foto disimpan di bucket product-images (path: testimonials/*)
-- agar next/image remotePatterns yang sudah ada tetap berlaku.
-- ===========================================================================

alter table public.testimonials
  add column if not exists avatar text;

comment on column public.testimonials.avatar is
  'URL publik foto profil (opsional). Null = tampilkan inisial nama.';
