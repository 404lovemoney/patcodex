# Agent Notes

## Project Overview

This repository is a Next.js 15 application for "沐绒宠物洗护", a Chinese pet grooming and spa appointment site. The main experience is a polished single-page marketing and booking flow with service sections, environment carousel, pricing cards, a location map preview, light/dark/system theme switching, and an appointment form.

## Tech Stack

- Framework: Next.js 15 with App Router.
- UI runtime: React 19.
- Language: TypeScript with `strict` enabled.
- Styling: Global CSS in `app/globals.css`; no Tailwind or component library is currently used.
- Images: `next/image`, with AVIF/WebP formats enabled in `next.config.mjs`.
- Database: PostgreSQL via `pg`.
- Hosting target: Netlify, with Netlify Database support through `@netlify/database`.
- Linting: ESLint 9 with Next core web vitals and TypeScript configs.

## Key Files

- `app/page.tsx`: Main client-side page. Contains theme state, carousel behavior, booking form submission, map lightbox state, and all page content.
- `app/layout.tsx`: Root layout, page metadata, global CSS import, and early theme initialization script to avoid theme flash.
- `app/globals.css`: Full visual system, responsive layout, theme variables, carousel, booking form, map, and lightbox styles.
- `app/api/bookings/route.ts`: `POST /api/bookings` endpoint. Validates form payload and inserts appointment bookings into `public.appointment_bookings`.
- `app/lib/db.ts`: Database pool helper. Uses Netlify Database when `NETLIFY=true`; otherwise uses `SESSION_DATABASE_URL`.
- `netlify/database/migrations/0001_create_appointment_bookings.sql`: Netlify Database schema for booking storage.
- `supabase/migrations/create_appointment_bookings.sql`: Supabase-compatible schema with RLS enabled and anon/authenticated access revoked.
- `scripts/migrate-bookings-to-netlify-db.mjs`: One-off migration script from `SESSION_DATABASE_URL` to Netlify Database or an explicit target URL.
- `public/assets/`: Runtime image assets used by the Next app.
- `assets/`: Source or duplicate visual assets kept outside the public runtime path.
- `index.html`: Older static page artifact; the active app entry is the Next.js `app` directory.

## Commands

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build production app: `npm run build`
- Start production server after build: `npm run start`
- Lint: `npm run lint`
- Migrate bookings to Netlify Database: `npm run migrate:bookings:netlify`

## Environment

- Local development requires `SESSION_DATABASE_URL` for booking writes.
- `.env.example` shows the expected variable shape.
- `.env.local` may contain real credentials and must not be committed.
- In Netlify, `app/lib/db.ts` calls `@netlify/database` when `process.env.NETLIFY === "true"`.
- The database connection uses SSL with `rejectUnauthorized: false`.

## Booking Data Flow

1. The appointment form in `app/page.tsx` collects name, phone, optional email, pet type, service, date, time, and notes.
2. The form submits JSON to `/api/bookings`.
3. `app/api/bookings/route.ts` trims string fields and validates:
   - `name` and `phone` are required.
   - phone length must be 6 to 32 characters.
   - date must match `YYYY-MM-DD` when present.
   - time must match `HH:MM` when present.
4. The API inserts into `public.appointment_bookings`, preserving the cleaned request as `form_payload`.
5. Success returns `{ id }`; failures return localized Chinese error messages.

## UI And Content Conventions

- The site language is Simplified Chinese and `app/layout.tsx` sets `lang="zh-CN"`.
- Keep copy warm, service-oriented, and consistent with a premium pet grooming brand.
- Existing UI uses compact 8px card/button radii, mint/coral accents, and CSS custom properties for theme support.
- Do not introduce a second styling system unless the project direction changes.
- New images intended for runtime should go in `public/assets/` and be referenced as `/assets/...`.
- Theme support depends on `html[data-theme="light" | "dark"]` CSS variables and local storage key `murong-theme-mode`.
- The page is currently a client component because it owns carousel timers, local storage theme state, form submission state, and lightbox behavior.

## Database Schema Notes

The booking table is `public.appointment_bookings` with:

- `id uuid primary key default gen_random_uuid()`
- customer/contact fields: `customer_name`, `phone`, `email`
- booking fields: `pet_type`, `appointment_date`, `appointment_time`, `service_type`, `notes`
- `form_payload jsonb`
- `status` constrained to `new`, `confirmed`, `cancelled`, `completed`
- `created_at` and `updated_at`
- indexes on `created_at desc` and `status`

The Supabase migration enables RLS and revokes table access from `anon` and `authenticated`, which matches the current server-only insert pattern.

## Working Safely In This Repo

- There may be local user changes. Check `git status --short` before editing and avoid touching unrelated modified files.
- Do not commit or expose `.env.local` or other ignored env files.
- Do not bulk delete files or directories. In particular, do not use `del /s`, `rd /s`, `rmdir /s`, `Remove-Item -Recurse`, or `rm -rf`.
- If deletion is necessary, delete only one explicit file path at a time, for example `Remove-Item "C:\path\to\file.txt"`.
- If a task appears to require bulk deletion, stop and ask the user to handle it manually.
- Prefer `rg` / `rg --files` for search when available.
- Use `npm run lint` and `npm run build` for verification when code changes affect app behavior.

## Current Observations

- The repository currently has local modifications in `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, and `next.config.mjs`; treat them as user-owned unless explicitly instructed otherwise.
- The active application is not the root `index.html`; it is the Next.js app under `app/`.
- Netlify deployment is configured by `netlify.toml` with build command `npm run build` and publish directory `.next`.
