-- ===========================================================================
-- Mushida-Craft: public SELECT categories hanya is_active = true
-- Admin (service role) tetap bypass RLS untuk baca/tulis semua baris.
-- ===========================================================================

drop policy if exists "Public dapat membaca kategori" on public.categories;
create policy "Public dapat membaca kategori aktif"
  on public.categories
  for select
  using (is_active = true);
