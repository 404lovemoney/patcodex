create or replace function public.set_appointment_bookings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointment_bookings_set_updated_at on public.appointment_bookings;

create trigger appointment_bookings_set_updated_at
before update on public.appointment_bookings
for each row
execute function public.set_appointment_bookings_updated_at();

create index if not exists appointment_bookings_status_date_idx
  on public.appointment_bookings (status, appointment_date);

create index if not exists appointment_bookings_date_time_idx
  on public.appointment_bookings (appointment_date, appointment_time);
