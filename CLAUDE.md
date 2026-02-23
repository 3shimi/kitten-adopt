# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cat adoption screening form (浪浪領養申請網站) for three rescued kittens — two Siamese, one black cat. Built with Vite + React 19, backed by Supabase (database + storage). All UI text is Traditional Chinese (Taiwan). Deployed to Vercel via GitHub auto-deploy on `main`.

**Production URL**: https://kitten-adopt.vercel.app

## Build & Run Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build locally
```

No test framework is configured.

## Architecture

### Single-File Component Design

The entire app lives in `src/App.jsx` (~500 lines). All components are defined in this one file:

- **CatAdoptionForm** (default export) — Main component with all form state, step navigation, and Supabase submission logic
- **FloatingPaws** — Decorative background paw emojis
- **CatCard** — Cat selection cards with hover/select effects
- **PhotoUploader** — File upload with preview (used in experience step for pet photos)
- **InputField / RadioGroup / ProgressBar** — Reusable form UI primitives

Entry point is `src/main.jsx` which renders `<CatAdoptionForm />`.

### 6-Step Form Flow

```
intro → catSelection → info → experience → review → done
```

Steps `intro`, `review`, and `done` are splash/confirmation screens. The three middle steps (`catSelection`, `info`, `experience`) show a progress bar. The `review` step displays a read-only summary of all form data before submission.

### Backend (Supabase)

- **Database**: `applications` table stores all form submissions. RLS enabled — anon can INSERT only; SELECT/UPDATE/DELETE require service role.
- **Storage**: `application-photos` private bucket for pet photos uploaded with the form. Anon can upload; signed URLs generated server-side for viewing.
- **Client**: `src/lib/supabase.js` creates the Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.

### Excel Export API

`api/export.js` is a Vercel Serverless Function that exports all applications as `.xlsx`:
- Auth: `Authorization: Bearer <EXPORT_SECRET>` header required
- Generates signed URLs for photos (7-day expiry)
- Column headers are in Traditional Chinese

### Styling

All styles are **inline JavaScript objects** — no CSS files exist. Uses Google Fonts loaded in `index.html`:
- Noto Sans TC (body text)
- Noto Serif TC (headings/labels)

Color palette: warm earth tones, primary gold `#deb970`, accent `#c0a87c`.

Mobile breakpoint at 480px via `useIsMobile()` custom hook.

### Key Conventions

- No external state management — React `useState` only
- Form data submitted to Supabase on the review step; photos uploaded to Supabase Storage
- Conditional fields: landlord approval appears only if renting; cat detail appears only if has cat experience; pet counts appear only if corresponding pet type is checked
- Cat data constants (`INDIVIDUAL_CATS`, `COMBO_OPTIONS`) are defined at module top level
- Image paths reference `public/cats/` (full photos + avatar crops)

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Frontend (build-time) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend (build-time) | Supabase anon key for client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (`api/export.js`) | Admin access for reading all data |
| `EXPORT_SECRET` | Server only (`api/export.js`) | Bearer token for export auth |

Local dev uses `.env.local` (gitignored). Production env vars are set in Vercel.

### Image Assets

`public/cats/` contains processed photos:

| File | Cat |
|------|-----|
| siamese1.jpg / siamese1-avatar.jpg | 小暹羅 1 號 (white socks, 0.75kg) |
| siamese2.jpg / siamese2-avatar.jpg | 小暹羅 2 號 (black socks, 0.45kg) |
| black3.jpg / black3-avatar.jpg | 小黑咖 3 號 (coffee-tinted black, 0.45kg) |
| duo.jpg | Siamese pair together |
| trio.jpg | All three together |

Avatars are used on the intro page; full photos on the cat selection page.
