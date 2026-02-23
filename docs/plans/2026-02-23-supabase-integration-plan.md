# Supabase Integration Implementation Plan

> **Status: COMPLETED** — All tasks implemented and verified on 2026-02-23.

**Goal:** Store cat adoption form submissions in Supabase (including photos) and provide an authenticated Excel export endpoint.

**Architecture:** Hybrid — frontend writes directly to Supabase via anon key (RLS: INSERT only), photos go to private Storage bucket, Excel export via Vercel Serverless Function with Bearer auth using service role key.

**Tech Stack:** Vite + React 19, @supabase/supabase-js, Supabase Storage, Vercel Serverless Functions, xlsx

**Note:** No test framework is configured. Each task uses manual verification steps instead of automated tests.

---

### Task 1: Create database table and RLS policies — DONE

Commit: `9f34e67`

Created `applications` table with all columns, constraints (char_length checks, age range), and RLS policies (anon INSERT only). Later migration `make_life_change_plan_nullable` changed `life_change_plan` to nullable since the field was removed from the UI.

---

### Task 2: Create private Storage bucket — DONE

Created `application-photos` private bucket with anon upload policy.

---

### Task 3: Install dependencies and set up environment — DONE

Commit: `9f34e67`

Installed `@supabase/supabase-js` and `xlsx`. Created `.env.local` and `src/lib/supabase.js`.

---

### Task 4: Add form submission logic — DONE

Commit: `5b60fbd`

Added `handleSubmit` async function with Supabase insert, submitting/error state, and wired submit button.

---

### Task 4.5: Add review confirmation step — DONE (added during implementation)

Commit: `2df748d`

Inserted `review` step between `experience` and `done`. Three read-only summary sections (cat selection, basic info, experience). Submit button moved from `experience` to `review`. Progress bar excludes `review` step.

---

### Task 5: Add photo upload to Supabase Storage — DONE

Commit: `059e481`

Photos uploaded to private `application-photos` bucket with unique paths (`{uuid}/{timestamp}-{random}.{ext}`). Failed uploads are skipped (don't block submission).

---

### Task 6: Create Excel export API route — DONE

Commit: `f84cd28`

Created `api/export.js` Vercel Serverless Function. Bearer token auth via `EXPORT_SECRET`. Generates signed photo URLs (7-day expiry). Chinese column headers. Returns `.xlsx` file download.

---

### Task 7: Deploy to Vercel — DONE

Commit: `7620375`

- Linked project via `vercel link`
- Set 4 env vars via `vercel env add` (note: use `printf` not `echo` to avoid trailing newline)
- Deployed with `vercel --prod`
- **Production URL**: https://kitten-adopt.vercel.app

---

### Task 8: End-to-end verification — DONE

| Test | Result |
|------|--------|
| Frontend loads (`/`) | 200 OK |
| Export with correct Bearer token | 200 + valid .xlsx |
| Export with wrong token | 401 Unauthorized |
| Export with no token | 401 Unauthorized |

---

## Lessons Learned

1. **`echo` adds trailing newline** — When piping env var values via `echo "value" | vercel env add`, the trailing `\n` becomes part of the value. Use `printf 'value'` instead.
2. **Supabase MCP for DB setup** — Using `apply_migration` and `execute_sql` MCP tools is faster than writing migration files for simple projects.
3. **`VITE_` prefix matters** — Only `VITE_`-prefixed env vars are bundled into the frontend. Server-only secrets (service role key, export secret) must NOT use this prefix.
