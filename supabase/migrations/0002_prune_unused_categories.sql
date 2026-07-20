-- ===========================================================================
-- Prune kategori yang tidak diproduksi dari tabel products yang sudah ada.
-- Aman dijalankan di production tanpa drop table (tidak menghapus produk
-- graduation / money-bouquet yang dibuat admin).
--
-- Jalankan di Supabase SQL Editor jika DB sudah di-seed dengan skema lama.
-- ===========================================================================

delete from public.products
where category in (
  'hand-bouquet',
  'wedding',
  'anniversary',
  'dried-flower'
);
