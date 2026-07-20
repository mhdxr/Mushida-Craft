-- ===========================================================================
-- Mushida-Craft: Testimonials table + RLS
-- Public SELECT only for approved rows. Inserts go through service-role API
-- so we can rate-limit and moderate before anything appears on the site.
-- ===========================================================================

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  message     text not null,
  rating      integer not null check (rating >= 1 and rating <= 5),
  status      text not null default 'pending'
                check (status in ('pending', 'approved')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_testimonials_status_created
  on public.testimonials(status, created_at desc);

alter table public.testimonials enable row level security;

drop policy if exists "Public dapat membaca testimoni approved" on public.testimonials;
create policy "Public dapat membaca testimoni approved"
  on public.testimonials
  for select
  using (status = 'approved');

-- No public INSERT/UPDATE/DELETE policies: all writes use the service role key
-- from API routes (rate-limited submit + admin moderation).
