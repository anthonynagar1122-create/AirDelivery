-- AirDelivery foundation schema (Phase 1).
-- Core operational entities plus an append-only audit log for every order change.
-- Row Level Security is enabled on every table. Policies arrive with auth in Phase 3.

create extension if not exists "pgcrypto";

create type order_status as enum (
  'draft',
  'awaiting_confirmation',
  'confirmed',
  'shopping',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type payment_mode as enum ('cash_on_delivery', 'upi_on_delivery');

create table customers (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  phone text unique,
  preferred_language text not null default 'en-IN'
    check (preferred_language in ('en-IN', 'hi-IN', 'hinglish')),
  consent_to_record_voice boolean not null default false,
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  label text,
  line text not null,
  landmark text,
  pincode text,
  created_at timestamptz not null default now()
);
create index addresses_customer_id_idx on addresses (customer_id);

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default 'AD-' || upper(substr(gen_random_uuid()::text, 1, 6)),
  customer_id uuid not null references customers (id),
  address_id uuid references addresses (id),
  status order_status not null default 'draft',
  payment_mode payment_mode not null default 'cash_on_delivery',
  delivery_fee_paise integer not null default 0 check (delivery_fee_paise >= 0),
  -- Null until a real price check has happened. Never estimated silently.
  items_total_paise integer check (items_total_paise is null or items_total_paise >= 0),
  confirmed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_id_idx on orders (customer_id);
create index orders_address_id_idx on orders (address_id);
create index orders_status_idx on orders (status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  -- 'sourced' = found on request, 'catalogue' = in a partner shop listing.
  source text not null default 'sourced' check (source in ('sourced', 'catalogue')),
  unit_price_paise integer check (unit_price_paise is null or unit_price_paise >= 0),
  created_at timestamptz not null default now()
);
create index order_items_order_id_idx on order_items (order_id);

-- Every status change is recorded. Nothing is updated in place without a trail.
create table order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders (id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  actor text not null,
  created_at timestamptz not null default now()
);
create index order_events_order_id_idx on order_events (order_id);

alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
