# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cat adoption application form (浪浪領養申請網站) built with React. A multi-step screening form for adopting three rescued kittens (two Siamese, one black cat). All UI text is in Traditional Chinese (Taiwan).

**Current state**: The project may need Vite + React initialization. The core component exists in `adoption-form.jsx` as a self-contained mockup with base64-embedded images. See `docs/plan.md` for the implementation plan to convert it into a runnable Vite project.

## Build & Run Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Production build
```

## Architecture

### Single-Component Design

The entire app lives in one main component (`adoption-form.jsx` / `src/App.jsx`) containing:

- **`CatAdoptionForm`** — Main component with all form state and 9-step flow
- **`FloatingPaws`** — Animated background paw prints
- **`CatCard`** — Cat selection cards with hover effects
- **`PhotoUploader`** — File upload with image preview
- **`InputField`**, **`RadioGroup`**, **`CheckItem`**, **`ProgressBar`** — Reusable form UI

### 9-Step Form Flow

`intro` → `catSelection` → `basic` → `environment` → `experience` → `plan` → `photos` → `agreement` → `done`

### Styling

All styles are inline JavaScript objects — no CSS files. Uses Google Fonts (Noto Sans TC, Noto Serif TC). Color palette is warm earth tones with primary gold `#deb970`.

### Image Assets

Cat photos in `pictures/` map to semantic names in `public/cats/`:

| Original | Semantic Name | Cat |
|----------|--------------|-----|
| IMG_7380.JPG | siamese1.jpg | 小暹羅1號 (white socks, 0.75kg) |
| IMG_7379.JPG | siamese2.jpg | 小暹羅2號 (black socks, 0.45kg) |
| IMG_7382.JPG | black3.jpg | 小黑3號 (coffee-tinted black, 0.45kg) |
| IMG_7393.JPG | duo.jpg | Siamese pair together |
| IMG_7392.JPG | trio.jpg | All three together |

### Key Conventions

- No external state management — React `useState` hooks only
- Form data stays client-side (no API integration)
- Conditional validation (e.g., landlord approval only if renting)
- Cross-validation between related fields (cat experience years vs. detailed history)
- All 6 adoption commitment checkboxes must be checked before submission
