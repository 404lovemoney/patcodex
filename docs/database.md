# Database and Booking Operations

## Local Development

Use `SESSION_DATABASE_URL` for local booking writes:

```env
SESSION_DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@POOLER_HOST:5432/postgres"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-a-local-admin-password"
ADMIN_TOKEN="replace-with-a-local-admin-token"
BOOKING_NOTIFICATION_WEBHOOK_URL=""
```

Do not set `NETLIFY=true` locally unless you intentionally want `app/lib/db.ts` to ask `@netlify/database` for the connection string. The app does not read a `NETLIFY_DATABASE_URL` variable directly.

## Netlify Runtime

On Netlify, `NETLIFY=true` is provided by the platform. In that mode, `app/lib/db.ts` uses `@netlify/database` to resolve the database connection string.

Set these environment variables in Netlify:

- `ADMIN_USERNAME`: admin login username.
- `ADMIN_PASSWORD`: admin login password.
- `ADMIN_TOKEN`: token returned by `/admin/login` and required by admin APIs.
- `BOOKING_NOTIFICATION_WEBHOOK_URL`: optional webhook for successful booking notifications.

## Migrations

Netlify Database migrations live in `netlify/database/migrations/`.

Supabase-compatible migrations live in `supabase/migrations/`. The Supabase table keeps RLS enabled and access revoked from `anon` and `authenticated`; if a future management backend uses Supabase Auth, add role-specific policies instead of opening public access.

## Admin Flow

Open `/admin/login`, sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`, then the client stores the returned token in `localStorage.booking_admin_token` and redirects to `/admin/bookings`.

The `/admin/bookings` page can:

- filter by status, appointment date, customer name, or phone
- show bookings in a paginated table, 10 rows per page
- open a detail dialog for a full booking view
- mark bookings as confirmed, cancelled, or completed
- export the current filtered result set as UTF-8 CSV with Excel-friendly phone values

The admin API requires the token in the `Authorization: Bearer <token>` header. If an API response is 401, the client clears the local token and redirects back to `/admin/login`.

The database status value for unconfirmed bookings is still `new`; the admin UI presents it as `pending` / `待确认` for operators.
