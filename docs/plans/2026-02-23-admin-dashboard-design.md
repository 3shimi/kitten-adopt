# 管理員後台 — 設計文件 v2

**日期**: 2026-02-23
**狀態**: 待實作

## Context

目前領養申請網站只有一個 Excel 匯出 API，管理員無法即時查看申請資料、做數據分析或快速篩選合適的領養者。本計畫新增一個管理員後台（`/admin`），提供：申請列表（排序/篩選）、統計總覽、自動評分系統。

---

## 架構決策

| 決策 | 方案 |
|------|------|
| 路由 | 加裝 `react-router-dom@7.1.1`（鎖定版本），`/` 表單，`/admin` 後台 |
| 認證 | Server-side session：`/api/admin/login` 驗證密碼 → 設 HttpOnly cookie，後續 API 只認 cookie |
| 資料讀取 | `api/admin/applications.js` 用 service role key，cookie 驗證 |
| 評分 | 純前端計算（`src/admin/scoring.js`），用常數映射而非字串比對 |
| 樣式 | 沿用現有 inline JS style + 同色系，不引入 CSS 框架 |

---

## 認證流程（v2 修正）

v1 問題：`VITE_ADMIN_PASSWORD` 會被打包進前端 bundle，任何人可讀；且 API 用 Bearer `EXPORT_SECRET` 會把 server secret 暴露到前端。

**v2 方案：Server-side session**

```
前端 /admin 頁面
  ↓ POST /api/admin/login { password }
伺服器驗證 password === ADMIN_SECRET (server env)
  ↓ 成功 → Set-Cookie: admin_session=<signed-token>; HttpOnly; Secure; SameSite=Strict
  ↓ 失敗 → 401
前端 GET /api/admin/applications
  ↓ 瀏覽器自動帶 cookie
伺服器驗證 cookie → 回傳資料
```

**環境變數分離**：
- `ADMIN_SECRET`（server only）— 後台登入密碼，與 `EXPORT_SECRET` 獨立
- `EXPORT_SECRET`（server only）— 僅用於 Excel 匯出 API，不變

**Session token**：用 `crypto.createHmac('sha256', ADMIN_SECRET).update(timestamp).digest('hex')` 產生，cookie 含 `token:timestamp`，驗證時檢查 HMAC 是否吻合 + timestamp 是否在 24 小時內。

---

## 評分系統

滿分 15 分。**實作用常數 enum 映射**，不直接比對中文字串，避免全形/半形括號等差異。

### 常數定義（`src/admin/scoring.js`）

```js
// 用 enum-like 常數，value 對應表單實際存入 DB 的值
const RULES = [
  {
    field: 'has_cat_before',
    label: '養貓經驗',
    scores: { '有': 3, '沒有但有做功課': 1 },
    default: 0,
  },
  {
    field: 'ownership',
    label: '住家',
    // 特殊邏輯：租屋需看 landlord_ok
    handler: (app) => {
      if (app.ownership === '自有') return 2;
      if (app.ownership === '租屋' && app.landlord_ok === '同意') return 1;
      return 0;
    },
  },
  {
    field: 'screen_installed',
    label: '紗窗/防墜網',
    scores: { '已安裝': 2, '願意安裝': 1, '無法安裝': -1 },
    default: 0,
  },
  {
    field: 'family_agree',
    label: '家人同意',
    scores: { '全部同意': 2 },
    default: 0,
  },
  {
    field: 'outdoor',
    label: '外出方式',
    scores: { '完全室內': 2, '偶爾外出（有牽繩）': 1, '自由進出': -2 },
    // ↑ 注意：全形括號，與 src/App.jsx:457 一致
    default: 0,
  },
  {
    field: 'financial',
    label: '經濟狀況',
    scores: { '有穩定收入': 2, '有家人支援': 1, '目前沒有': -1 },
    default: 0,
  },
  {
    field: 'selected_cats',
    label: '領養組合',
    handler: (app) => {
      const cats = app.selected_cats || [];
      if (cats.includes('trio')) return 2;
      if (cats.includes('duo')) return 1;
      return 0;
    },
  },
];
```

---

## API 設計（v2 修正）

### `POST /api/admin/login` — 登入（新增）
- Body: `{ password: string }`
- 驗證 `password === process.env.ADMIN_SECRET`
- 成功 → `Set-Cookie: admin_session=<token>:<timestamp>; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=86400`
- 失敗 → `401 { error: "密碼錯誤" }`

### `GET /api/admin/applications` — 申請列表（新增）
- 認證：檢查 `admin_session` cookie（HMAC + 過期）
- Query params：
  - `page`（預設 1）、`limit`（預設 50，上限 200）
  - `sort`（`created_at` | `name` | `score`，預設 `created_at`）
  - `order`（`asc` | `desc`，預設 `desc`）
  - `cat`（篩選特定貓咪，e.g. `siamese1`）
  - `search`（姓名/電話模糊搜尋）
- 回傳：
  ```json
  {
    "applications": [...],
    "pagination": { "page": 1, "limit": 50, "total": 123 },
    "photoUrls": { "<app_id>": ["<signed_url>", ...] }
  }
  ```
- Photo signed URLs：批次產生（`Promise.all`），7 天有效期

### `GET /api/admin/stats` — 統計資料（獨立端點）
- 認證：同上 cookie 驗證
- 回傳：
  ```json
  {
    "total": 123,
    "byCat": { "siamese1": 30, "siamese2": 25, "black3": 20, "duo": 28, "trio": 20 },
    "avgScore": 9.2,
    "maxScore": 14,
    "minScore": 2,
    "byDate": [{ "date": "2026-02-20", "count": 5 }, ...]
  }
  ```

### `POST /api/admin/logout` — 登出（新增）
- 清除 cookie

---

## 新增/修改檔案

### 1. `package.json` — 新增 dependency
```
+ "react-router-dom": "7.1.1"
```

### 2. `src/main.jsx` — 加入路由
```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CatAdoptionForm from "./App.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatAdoptionForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

### 3. `src/admin/scoring.js` — 評分算法（純函式）
- `calculateScore(application)` → `{ total, max: 15, breakdown: [{field, label, value, points}] }`
- 用上述 RULES 常數映射，支援 `scores` 查表和 `handler` 自訂邏輯
- 匯出為 ES module

### 4. `api/admin/login.js` — 登入 API（新增）
- POST only
- 驗證密碼，設 HttpOnly cookie

### 5. `api/admin/applications.js` — 申請列表 API（新增）
- GET only，cookie 認證
- 分頁 + 排序 + 篩選
- 批次產生 photo signed URLs

### 6. `api/admin/stats.js` — 統計 API（新增）
- GET only，cookie 認證
- 聚合統計資料

### 7. `api/admin/logout.js` — 登出 API（新增）
- POST only，清除 cookie

### 8. `api/admin/_auth.js` — 共用認證工具（新增）
- `verifySession(req)` — 解析 cookie、驗證 HMAC、檢查過期
- `createSession(res)` — 產生 token、設 cookie
- 被 login/applications/stats/logout 共用

### 9. `src/admin/AdminDashboard.jsx` — 主元件（新增）
- 登入畫面（POST /api/admin/login）
- 通過驗證後顯示 dashboard
- 頂部：標題 + 登出按鈕
- 統計卡片區 + 申請列表

### 10. `src/admin/StatsCards.jsx` — 統計卡片元件（新增）

### 11. `src/admin/ApplicationTable.jsx` — 申請列表元件（新增）

### 12. `src/admin/ApplicationDetail.jsx` — 申請詳情元件（新增）

---

## 實作順序

1. **安裝 react-router-dom@7.1.1**，改 `main.jsx` 加路由
2. **建立 `api/admin/_auth.js`** — 共用認證工具
3. **建立 `api/admin/login.js` + `api/admin/logout.js`** — 登入登出
4. **建立 `src/admin/scoring.js`** — 評分邏輯（常數映射）
5. **建立 `api/admin/applications.js`** — 申請列表 API（分頁 + 篩選）
6. **建立 `api/admin/stats.js`** — 統計 API
7. **建立 `src/admin/AdminDashboard.jsx`** — 登入 + 整體佈局
8. **建立 `src/admin/StatsCards.jsx`** — 統計卡片
9. **建立 `src/admin/ApplicationTable.jsx`** — 申請列表
10. **建立 `src/admin/ApplicationDetail.jsx`** — 展開詳情
11. **環境變數**：加 `ADMIN_SECRET` 到 `.env.local` 和 Vercel

---

## 環境變數變更

| 變數 | 範圍 | 用途 |
|------|------|------|
| `ADMIN_SECRET` | Server only | 後台登入密碼 + HMAC 簽名 |

現有變數不變：`EXPORT_SECRET` 僅用於 Excel 匯出，`SUPABASE_SERVICE_ROLE_KEY` 共用。

---

## 錯誤處理

| 情境 | 回應 |
|------|------|
| 未登入/cookie 過期 | 401 → 前端導回登入畫面 |
| 密碼錯誤 | 401 + `{ error: "密碼錯誤" }` |
| Supabase 查詢失敗 | 500 + `{ error: message }` |
| Photo signed URL 失敗 | 該照片 URL 回傳 null，不影響其他資料 |
| 無申請資料 | 200 + 空陣列，前端顯示「尚無申請」 |
| 分頁超出範圍 | 200 + 空陣列 |

---

## 驗證方式

### Happy Path
1. `npm run dev` → `/` 表單功能正常
2. `/admin` → 看到登入畫面
3. 輸入正確密碼 → 看到統計卡片 + 申請列表
4. 測試排序、篩選、搜尋
5. 展開申請 → 確認詳情 + 評分明細 + 照片
6. `npm run build` 成功

### Error Path
7. 錯誤密碼 → 顯示錯誤訊息
8. 清除 cookie → 重新整理被導回登入
9. 直接打 `/api/admin/applications` 無 cookie → 401
10. 空資料庫 → 顯示「尚無申請」
11. 登出按鈕 → 清除 session 回到登入
