# 浪浪領養申請網站 — 專案架構

## Overview

三隻救援幼貓（兩隻暹羅、一隻黑貓）的領養申請篩選表單。Vite + React 單組件架構，所有 UI 文字為繁體中文。

## Tech Stack

- **Framework**: Vite + React 19
- **Styling**: Inline JavaScript objects（無 CSS 檔案）
- **Fonts**: Google Fonts — Noto Sans TC, Noto Serif TC
- **Deployment**: Vercel（GitHub 連動自動部署）
- **State**: React `useState` only，無外部狀態管理

## Project Structure

```
├── src/
│   ├── App.jsx          # 主要元件（所有表單邏輯與子組件）
│   └── main.jsx         # 入口
├── public/cats/         # 處理過的貓咪照片與頭像
├── reference/           # 原始 mockup（不進 repo）
├── docs/                # 專案文件
├── index.html           # HTML 入口（含 Google Fonts）
├── vite.config.js
└── package.json
```

## Form Flow

```
intro → catSelection → info → experience → done
```

5 步驟，3 個表單頁（info、experience 為填寫頁）。Photos 和 agreement 步驟已移除以精簡流程。

## Cat Data

| Key | 名字 | 描述 |
|-----|------|------|
| siamese1 | 小暹羅 1 號 | 穿白襪子，0.75kg |
| siamese2 | 小暹羅 2 號 | 穿黑襪子，0.45kg |
| black3 | 小黑咖 3 號 | 帶咖啡色的黑，0.45kg |

三隻皆為母貓。

## Image Assets

`public/cats/` 中的檔案：

| 檔案 | 用途 |
|------|------|
| siamese1.jpg, siamese2.jpg, black3.jpg | 貓咪大圖 |
| siamese1-avatar.jpg, siamese2-avatar.jpg, black3-avatar.jpg | 選擇卡片頭像 |
| duo.jpg | 暹羅兩姐妹合照 |
| trio.jpg | 三姐妹合照 |

原始照片對應：IMG_7380→siamese1, IMG_7379→siamese2, IMG_7382→black3, IMG_7393→duo, IMG_7392→trio

## Components（all in App.jsx）

- **CatAdoptionForm** — 主組件，管理表單狀態與步驟流程
- **FloatingPaws** — 背景貓掌動畫
- **CatCard** — 貓咪選擇卡片（hover + 勾選效果）
- **InputField / RadioGroup / CheckItem / ProgressBar** — 可重用表單 UI

## Repo

- **GitHub**: https://github.com/3shimi/kitten-adopt
- **Branch strategy**: main（透過 Vercel 自動部署）
