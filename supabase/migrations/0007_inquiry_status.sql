-- ===========================================================================
-- Mushida-Craft: status pipeline untuk inquiry WA
-- new → contacted → archived (opsional, bukan OMS penuh)
-- ===========================================================================

alter table public.inquiries
  add column if not exists status text not null default 'new';

-- Backfill aman bila kolom sudah ada dengan null (shouldn't happen with NOT NULL default).
update public.inquiries
set status = 'new'
where status is null or status = '';

-- Constraint: drop dulu bila re-run.
alter table public.inquiries
  drop constraint if exists inquiries_status_check;

alter table public.inquiries
  add constraint inquiries_status_check
  check (status in ('new', 'contacted', 'archived'));

create index if not exists idx_inquiries_status_created
  on public.inquiries (status, created_at desc);

comment on column public.inquiries.status is
  'Pipeline lead: new | contacted | archived';
