-- ===========================================================================
-- Mushida-Craft: Public product image bucket + Storage policies
-- ===========================================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public dapat membaca gambar produk" on storage.objects;
create policy "Public dapat membaca gambar produk"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');

drop policy if exists "Service role dapat mengelola gambar produk" on storage.objects;
create policy "Service role dapat mengelola gambar produk"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');
