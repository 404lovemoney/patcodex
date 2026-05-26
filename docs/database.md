# Database and Booking Operations

## Local Development

Use `SESSION_DATABASE_URL` for local booking writes:

```env
SESSION_DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@POOLER_HOST:5432/postgres"
BOOKING_ADMIN_TOKEN="replace-with-a-local-admin-token"
BOOKING_NOTIFICATION_WEBHOOK_URL=""
```

Do not set `NETLIFY=true` locally unless you intentionally want `app/lib/db.ts` to ask `@netlify/database` for the connection string. The app does not read a `NETLIFY_DATABASE_URL` variable directly.

## Netlify Runtime

On Netlify, `NETLIFY=true` is provided by the platform. In that mode, `app/lib/db.ts` uses `@netlify/database` to resolve the database connection string.

Set these environment variables in Netlify:

- `BOOKING_ADMIN_TOKEN`: required for `/admin/bookings` and `/api/admin/bookings`.
- `BOOKING_NOTIFICATION_WEBHOOK_URL`: optional webhook for successful booking notifications.

## Migrations

Netlify Database migrations live in `netlify/database/migrations/`.

Supabase-compatible migrations live in `supabase/migrations/`. The Supabase table keeps RLS enabled and access revoked from `anon` and `authenticated`; if a future management backend uses Supabase Auth, add role-specific policies instead of opening public access.

## Admin Flow

Open `/admin/bookings`, enter `BOOKING_ADMIN_TOKEN`, then load bookings. The page can:

- filter by status and appointment date
- mark bookings as new, confirmed, cancelled, or completed
- export the current filtered view as CSV

The admin API requires the token in the `x-admin-token` header.
