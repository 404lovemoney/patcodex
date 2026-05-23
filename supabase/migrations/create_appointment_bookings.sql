create extension if not exists pgcrypto;

create table if not exists public.appointment_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  pet_type text,
  appointment_date date,
  appointment_time time without time zone,
  service_type text,
  notes text,
  form_payload jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_bookings_phone_length check (char_length(phone) between 6 and 32),
  constraint appointment_bookings_status_check check (status in ('new', 'confirmed', 'cancelled', 'completed'))
);

create index if not exists appointment_bookings_created_at_idx
  on public.appointment_bookings (created_at desc);

create index if not exists appointment_bookings_status_idx
  on public.appointment_bookings (status);

alter table public.appointment_bookings enable row level security;

revoke all on table public.appointment_bookings from anon, authenticated;
