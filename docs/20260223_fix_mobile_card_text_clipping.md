# 修復手機版卡片文字被裁切問題

**日期**: 2026-02-23

## 問題描述

手機版（≤480px）的貓咪選擇頁面，卡片下方的標題（名稱）和副標題（描述、體重）沒有完整顯示，被卡片的 `overflow: hidden` 裁切掉。

## 根本原因

CSS Flexbox 的 `flex-direction: column` 搭配 `flex-wrap: wrap` 會觸發瀏覽器的高度計算問題。在沒有明確高度的 column-wrap 容器中，瀏覽器會錯誤地壓縮子元素高度，導致卡片實際渲染高度小於內容所需高度。

透過 DevTools 確認：
- 每張卡片的 `scrollHeight`（完整內容高度）為 253px
- 但實際渲染高度只有 193–232px
- 文字區域溢出卡片邊界 22–66px，被 `overflow: hidden` 裁切

## 修改內容

**檔案**: `src/App.jsx`

### 1. 卡片 flex 屬性（CatCard 元件，第 72 行）

```diff
- flex: mobile ? "1 1 100%" : isCombo ? "1 1 calc(50% - 8px)" : "1 1 calc(33.33% - 11px)",
+ flex: mobile ? "0 0 auto" : isCombo ? "1 1 calc(50% - 8px)" : "1 1 calc(33.33% - 11px)",
```

手機版改為 `0 0 auto`：不伸展、不壓縮、使用內容自然高度。

### 2. 容器 flexWrap（一起領養區塊，第 280 行；單獨領養區塊，第 287 行）

```diff
- flexWrap: "wrap",
+ flexWrap: mobile ? "nowrap" : "wrap",
```

手機版改為 `nowrap`，避免 column + wrap 的瀏覽器高度計算 bug。桌面版維持 `wrap` 以支援多欄排列。

## 驗證結果

- 手機版（375x812）：所有卡片標題、描述、體重文字完整顯示，圖片尺寸一致
- 桌面版（1280x800）：一起領養 2 張並排、單獨領養 3 張並排，佈局不受影響
