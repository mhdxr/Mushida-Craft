-- ===========================================================================
-- Mushida-Craft: WA inquiry / lead log
-- Catat klik order WhatsApp & custom order (bukan OMS penuh).
-- Semua write lewat service role API (rate-limited); admin read via service role.
-- ===========================================================================

create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  source        text not null
                  check (source in (
                    'pdp_inline',
                    'pdp_sticky',
                    'custom_order',
                    'fab',
                    'footer',
                    'delivery_note',
                    'other'
                  )),
  product_id    text,
  product_slug  text,
  product_name  text,
  product_price integer,
  customer_name text,
  customer_wa   text,
  notes         text,
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_inquiries_created
  on public.inquiries (created_at desc);

create index if not exists idx_inquiries_source_created
  on public.inquiries (source, created_at desc);

alter table public.inquiries enable row level security;

-- Tidak ada policy public: insert/list hanya service role dari API.
