# 浪浪領養申請網站 — 專案架構

## Overview

三隻救援幼貓（兩隻暹羅、一隻黑貓）的領養申請篩選表單。Vite + React 單組件架構，Supabase 作為後端（資料庫 + Storage），Vercel Serverless Function 提供 Excel 匯出。所有 UI 文字為繁體中文。

## Tech Stack

- **Framework**: Vite + React 19
- **Backend**: Supabase (PostgreSQL + Storage)
- **Styling**: Inline JavaScript objects（無 CSS 檔案）
- **Fonts**: Google Fonts — Noto Sans TC, Noto Serif TC
- **Deployment**: Vercel（GitHub 連動自動部署）
- **State**: React `useState` only，無外部狀態管理
- **Export**: Vercel Serverless Function + `xlsx` 套件

## Project Structure

```
├── src/
│   ├── App.jsx              # 主要元件（所有表單邏輯與子組件）
│   ├── lib/
│   │   └── supabase.js      # Supabase client（anon key）
│   └── main.jsx             # 入口
├── api/
│   └── export.js            # Vercel Serverless Function（Excel 匯出）
├── public/cats/             # 處理過的貓咪照片與頭像
├── docs/                    # 專案文件
├── index.html               # HTML 入口（含 Google Fonts）
├── vite.config.js
├── .env.local               # 本地環境變數（gitignored）
└── package.json
```

## Architecture Diagram

```
[Browser]
  ├── Form submit ──→ Supabase DB (anon key, INSERT only via RLS)
  ├── Photo upload ──→ Supabase Storage (private bucket, anon upload)
  └── View site ────→ Vercel CDN (static SPA)

[Vercel Serverless]
  └── GET /api/export ──→ Supabase DB (service role key) ──→ .xlsx download
       (Authorization: Bearer <EXPORT_SECRET>)
```

## Form Flow

```
intro → catSelection → info → experience → review → done
```

6 步驟。`catSelection`、`info`、`experience` 為填寫頁（顯示進度條）。`review` 為確認頁（顯示資料摘要，送出按鈕在此）。`intro` 和 `done` 為閃屏/完成頁。

## Database Schema

### Table: `applications`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | PK | gen_random_uuid() |
| created_at | timestamptz | NOT NULL | now() |
| selected_cats | text[] | NOT NULL | e.g. `{siamese1}` |
| name | text | NOT NULL | max 100 chars |
| gender | text | NOT NULL | |
| age | int | NOT NULL | CHECK 0 < age < 120 |
| phone | text | NOT NULL | max 50 chars |
| financial | text | NOT NULL | |
| ownership | text | NOT NULL | |
| landlord_ok | text | nullable | only if renting |
| screen_installed | text | NOT NULL | |
| family_agree | text | NOT NULL | |
| has_cat_before | text | NOT NULL | |
| cat_detail | text | nullable | |
| has_dog | boolean | NOT NULL | default false |
| dog_count | text | nullable | |
| has_cat | boolean | NOT NULL | default false |
| cat_count | text | nullable | |
| has_other | boolean | NOT NULL | default false |
| other_detail | text | nullable | |
| outdoor | text | NOT NULL | |
| life_change_plan | text | nullable | max 2000 chars |
| photo_paths | text[] | nullable | Storage object paths |

### Row Level Security

- **INSERT**: allow for `anon` role
- **SELECT / UPDATE / DELETE**: denied for `anon` (only service role)

### Storage Bucket: `application-photos`

- Private bucket (not publicly accessible)
- Anon can upload (INSERT policy)
- Photos accessed via signed URLs (generated server-side in export)
- Path format: `{application_id}/{timestamp}-{random}.{ext}`

## Cat Data

| Key | 名字 | 描述 |
|-----|------|------|
| siamese1 | 小暹羅 1 號 | 穿白襪子，0.75kg |
| siamese2 | 小暹羅 2 號 | 穿黑襪子，0.45kg |
| black3 | 小黑咖 3 號 | 帶咖啡色的黑，0.45kg |

三隻皆為母貓。組合選項：`trio`（三姐妹）、`duo`（暹羅兩姐妹）。

## Image Assets

`public/cats/` 中的檔案：

| 檔案 | 用途 |
|------|------|
| siamese1.jpg, siamese2.jpg, black3.jpg | 貓咪大圖 |
| siamese1-avatar.jpg, siamese2-avatar.jpg, black3-avatar.jpg | 首頁頭像 |
| duo.jpg | 暹羅兩姐妹合照 |
| trio.jpg | 三姐妹合照 |

## Components（all in App.jsx）

- **CatAdoptionForm** — 主組件，管理表單狀態、步驟流程、Supabase 送出邏輯
- **FloatingPaws** — 背景貓掌裝飾
- **CatCard** — 貓咪選擇卡片（hover + 勾選效果）
- **PhotoUploader** — 照片上傳與預覽
- **InputField / RadioGroup / ProgressBar** — 可重用表單 UI

## Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin DB access (export API) |
| `EXPORT_SECRET` | Server only | Bearer token for export auth |

## Repo

- **GitHub**: https://github.com/3shimi/kitten-adopt
- **Production**: https://kitten-adopt.vercel.app
- **Branch strategy**: main（透過 Vercel 自動部署）
- **Supabase project**: jxekcdsfswtgkmpyvqua
