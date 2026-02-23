# 浪浪領養申請網站 — 實作計畫

## Context

使用者撿到三隻流浪幼貓（兩隻暹羅、一隻黑貓），想建立一個領養申請網站來篩選負責任的領養人。前一位工程師已做好 `adoption-form.jsx` mockup，但圖片以 base64 嵌入（260KB），且尚未設為可運行的專案。使用者要求：
1. 用 `pictures/` 資料夾中的 5 張實際照片取代 base64
2. 移除醫療觀念測驗（現有 mockup 已無此步驟，確認OK）
3. 貓咪選擇功能（已存在於 mockup 中，確認OK）

## 照片對應

| 檔案 | Key | 貓咪 |
|------|-----|------|
| `IMG_7380.JPG` | siamese1 | 小暹羅1號（穿白襪子，0.75kg） |
| `IMG_7379.JPG` | siamese2 | 小暹羅2號（穿黑襪子，0.45kg） |
| `IMG_7382.JPG` | black3 | 小黑3號（帶咖啡色的黑，0.45kg） |
| `IMG_7393.JPG` | duo | 暹羅兩姐妹合照 |
| `IMG_7392.JPG` | trio | 三姐妹合照 |

## 實作步驟

### 1. 初始化 Vite + React 專案
- 在 `/Users/shara/Documents/Projects/Kittens` 執行 `npm create vite@latest . -- --template react`
- 安裝依賴 `npm install`

### 2. 整理圖片資源
- 將 `pictures/` 中的 5 張照片複製到 `public/cats/` 目錄
- 重新命名為語義化名稱：
  - `siamese1.jpg`（IMG_7380）
  - `siamese2.jpg`（IMG_7379）
  - `black3.jpg`（IMG_7382）
  - `duo.jpg`（IMG_7393）
  - `trio.jpg`（IMG_7392）

### 3. 改寫 adoption-form.jsx
- **修改檔案**：`src/App.jsx`（將 adoption-form.jsx 的內容搬入）
- 移除 `CAT_IMAGES` 的 base64 常數，改用 `/cats/xxx.jpg` 路徑引用
- 確認 STEPS 中無醫療測驗步驟（已確認）
- 保留所有現有功能：貓咪選擇、基本資料、居住環境、養貓經驗、飼養規劃、照片上傳、領養承諾
- 加入 Google Fonts 引用（Noto Sans TC, Noto Serif TC）

### 4. 清理入口檔案
- 更新 `index.html` 加入 Google Fonts link
- 簡化 `src/main.jsx` 為標準入口
- 刪除 Vite 預設的多餘檔案（App.css, index.css 等）

### 5. 最終檢查
- 原始 `adoption-form.jsx` 保留不動（作為備份參考）
- `pictures/` 原始照片保留不動

## 修改的檔案清單
- `src/App.jsx`（新建，主要元件）
- `src/main.jsx`（修改，簡化入口）
- `index.html`（修改，加字體）
- `public/cats/`（新建，放置優化後的照片）

## 保留不動的現有功能
- `CatCard` 元件（行 90-203）— 貓咪選擇卡片，含 hover 動畫與勾選效果
- `PhotoUploader` 元件（行 204-238）— 照片上傳與預覽
- `InputField`、`RadioGroup`、`CheckItem`、`ProgressBar` 等 UI 元件
- `FloatingPaws` 背景動畫
- 7 步驟表單流程：貓咪選擇 → 基本資料 → 居住環境 → 養貓經驗 → 飼養規劃 → 照片上傳 → 領養承諾
- 交叉驗證題目設計（養貓年數 vs 細節經歷）

## 驗證方式
1. `npm run dev` 啟動開發伺服器
2. 確認首頁正常顯示，照片載入無誤
3. 走完全部 7 個步驟流程，確認每步切換正常
4. 確認貓咪選擇卡片顯示正確照片與資訊
5. 確認照片上傳功能可用
6. 確認無醫療觀念測驗步驟
