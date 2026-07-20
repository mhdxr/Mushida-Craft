-- ===========================================================================
-- Prune kategori lama yang tidak diproduksi dari tabel products existing.
-- Aman dijalankan di production tanpa drop table.
--
-- Kategori yang DIPERTAHANKAN:
--   snack-bouquet, money-bouquet, artificial-bouquet, graduation, satin-flower
-- ===========================================================================

delete from public.products
where category not in (
  'snack-bouquet',
  'money-bouquet',
  'artificial-bouquet',
  'graduation',
  'satin-flower'
);
