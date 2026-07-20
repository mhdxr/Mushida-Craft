-- ===========================================================================
-- Prune kategori lama yang tidak diproduksi dari tabel products existing.
-- Aman dijalankan di production tanpa drop table.
--
-- Kategori yang DIPERTAHANKAN:
--   snack-bouquet, money-bouquet, artificial-bouquet, graduation-bouquet, satin-flower
-- ===========================================================================

-- Migrasi id lama "graduation" → "graduation-bouquet" (jika masih ada).
update public.products
set category = 'graduation-bouquet'
where category = 'graduation';

delete from public.products
where category not in (
  'snack-bouquet',
  'money-bouquet',
  'artificial-bouquet',
  'graduation-bouquet',
  'satin-flower'
);
