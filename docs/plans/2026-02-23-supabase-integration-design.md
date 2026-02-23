# Supabase Integration Design

> **Status: COMPLETED** — All tasks implemented and deployed on 2026-02-23.

## Overview

Add backend data persistence to the cat adoption form. Form submissions are stored in Supabase (including uploaded photos), and an authenticated API endpoint provides Excel export for the form owner.

## Architecture: Hybrid

```
[Browser]
  |
  |-- Form submit --> Supabase (anon key, INSERT only via RLS)
  |-- Photo upload --> Supabase Storage (private bucket)
  |
[Vercel Serverless]
  |
  |-- GET /api/export --> Supabase (service role key) --> .xlsx download
       (Authorization: Bearer <token>)
```

### Why Hybrid

- The app is Vite + React SPA (no built-in backend like Next.js)
- For a simple adoption form, frontend direct-write with RLS is sufficient
- Only the export endpoint needs server-side code (to protect service role key and read all rows)

## Database Schema

### Table: `applications`

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| created_at | timestamptz | NOT NULL, default now() | |
| selected_cats | text[] | NOT NULL | e.g. `{siamese1,duo}` |
| name | text | NOT NULL, max 100 chars | |
| gender | text | NOT NULL | |
| age | int | NOT NULL, CHECK (age > 0 AND age < 120) | |
| phone | text | NOT NULL, max 50 chars | |
| financial | text | NOT NULL | |
| ownership | text | NOT NULL | |
| landlord_ok | text | | nullable, only relevant if renting |
| screen_installed | text | NOT NULL | |
| family_agree | text | NOT NULL | |
| has_cat_before | text | NOT NULL | |
| cat_detail | text | | nullable |
| has_dog | boolean | NOT NULL, default false | |
| dog_count | text | | nullable |
| has_cat | boolean | NOT NULL, default false | |
| cat_count | text | | nullable |
| has_other | boolean | NOT NULL, default false | |
| other_detail | text | | nullable |
| outdoor | text | NOT NULL | |
| life_change_plan | text | | nullable (field removed from UI) |
| photo_paths | text[] | default '{}' | Supabase Storage object paths |

### Row Level Security

- **INSERT**: allow for `anon` role (public form submission)
- **SELECT / UPDATE / DELETE**: deny for `anon` (only service role can read)

## Supabase Storage

- **Bucket**: `application-photos` (private)
- **Upload path**: `{application_id}/{timestamp}-{random}.{ext}`
- **Access**: signed URLs generated server-side when needed (e.g., in export, 7-day expiry)
- File uploads happen from the browser using anon key; the bucket policy allows INSERT for anon but not SELECT

## Export API

- **Endpoint**: `GET /api/export`
- **Auth**: `Authorization: Bearer <EXPORT_SECRET>` header; `EXPORT_SECRET` stored as Vercel environment variable
- **Response**: `.xlsx` file download with Chinese column headers
- **Library**: `xlsx` package (same as essence-oil-shop)
- **Photo handling**: generates signed URLs (7-day expiry) for each photo path

## Frontend Changes

- Added `@supabase/supabase-js` dependency
- Created `src/lib/supabase.js` with anon client
- Added review confirmation step before submission
- On form submit (step `review` -> `done`):
  1. Upload photos to Storage, collect paths
  2. Insert row into `applications` table
  3. Show success/error feedback
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Vercel Deployment

- **Production URL**: https://kitten-adopt.vercel.app
- Deploy via GitHub auto-deploy on `main`
- Environment variables set via Vercel CLI:
  - `VITE_SUPABASE_URL` — Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — Supabase anon key
  - `SUPABASE_SERVICE_ROLE_KEY` — for export API only (server-side)
  - `EXPORT_SECRET` — Bearer token for export auth

## File Changes Summary

| Action | File | Purpose | Status |
|--------|------|---------|--------|
| Create | `src/lib/supabase.js` | Supabase client init | Done |
| Edit | `src/App.jsx` | Add submit logic + upload + review step | Done |
| Create | `api/export.js` | Vercel serverless function for Excel export | Done |
| Create | `.env.local` (gitignored) | Local env vars | Done |
| Edit | `package.json` | Add `@supabase/supabase-js` and `xlsx` | Done |
| SQL | Supabase migration | Create table + RLS + storage bucket | Done |

## Deviations from Original Plan

1. **`life_change_plan`** — Changed to nullable. The form field was removed from the UI prior to this work, so the DB column was made nullable to match.
2. **Review step added** — New `review` confirmation step inserted between `experience` and `done`. Submit button moved from `experience` to `review`.
3. **Form flow** — Updated from 5-step to 6-step: `intro → catSelection → info → experience → review → done`.
