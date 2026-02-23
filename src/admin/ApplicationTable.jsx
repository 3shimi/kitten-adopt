import { useState, useEffect } from "react";
import ApplicationDetail from "./ApplicationDetail.jsx";

const CAT_NAMES = {
  siamese1: "小暹羅 1 號",
  siamese2: "小暹羅 2 號",
  black3: "小黑咖 3 號",
  duo: "暹羅兩姐妹",
  trio: "三姐妹",
};

const CAT_FILTER_OPTIONS = [
  { value: "", label: "全部" },
  { value: "siamese1", label: "小暹羅 1 號" },
  { value: "siamese2", label: "小暹羅 2 號" },
  { value: "black3", label: "小黑咖 3 號" },
  { value: "duo", label: "暹羅兩姐妹" },
  { value: "trio", label: "三姐妹" },
];

const SORTABLE_FIELDS = {
  created_at: "送出時間",
  name: "姓名",
  score: "評分",
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapCatNames(selectedCats) {
  if (!selectedCats || !Array.isArray(selectedCats) || selectedCats.length === 0) {
    return "—";
  }
  return selectedCats.map((c) => CAT_NAMES[c] || c).join("\u3001");
}

function ScoreBadge({ score }) {
  if (!score) return <span style={{ color: "#8b7d6b" }}>—</span>;

  const { total, max } = score;
  let bg, color;
  if (total >= 10) {
    bg = "#e8f5e9";
    color = "#2e7d32";
  } else if (total >= 5) {
    bg = "#fff8e1";
    color = "#f57f17";
  } else {
    bg = "#fce4ec";
    color = "#c62828";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Noto Sans TC', sans-serif",
        background: bg,
        color: color,
        whiteSpace: "nowrap",
      }}
    >
      {total}/{max}
    </span>
  );
}

function SkeletonRow({ isMobile }) {
  const cellStyle = {
    padding: "14px 12px",
    borderBottom: "1px solid #ddd3c4",
  };
  const barStyle = (width) => ({
    height: 14,
    width,
    borderRadius: 6,
    background: "linear-gradient(90deg, #ede6da 25%, #f5efe5 50%, #ede6da 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  });

  return (
    <tr>
      <td style={cellStyle}><div style={barStyle("70%")} /></td>
      <td style={cellStyle}><div style={barStyle("50%")} /></td>
      <td style={cellStyle}><div style={barStyle("80%")} /></td>
      <td style={cellStyle}><div style={barStyle("40%")} /></td>
      {!isMobile && (
        <>
          <td style={cellStyle}><div style={barStyle("60%")} /></td>
          <td style={cellStyle}><div style={barStyle("50%")} /></td>
        </>
      )}
    </tr>
  );
}

export default function ApplicationTable({
  applications,
  photoUrls,
  loading,
  pagination,
  onPageChange,
  sort,
  order,
  onSortChange,
  catFilter,
  onCatFilterChange,
  search,
  onSearchChange,
  expandedId,
  onExpandToggle,
}) {
  const isMobile = useIsMobile();
  const [hoveredRow, setHoveredRow] = useState(null);

  const { page, limit, total } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  // -- Styles --

  const containerStyle = {
    fontFamily: "'Noto Sans TC', sans-serif",
    color: "#3a2e26",
  };

  const topBarStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    gap: 12,
    marginBottom: 16,
  };

  const searchInputStyle = {
    flex: isMobile ? "unset" : "0 1 300px",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #ddd3c4",
    fontSize: 14,
    fontFamily: "'Noto Sans TC', sans-serif",
    color: "#3a2e26",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const selectStyle = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #ddd3c4",
    fontSize: 14,
    fontFamily: "'Noto Sans TC', sans-serif",
    color: "#3a2e26",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
    minWidth: isMobile ? "unset" : 160,
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b7d6b'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 32,
  };

  const scrollWrapperStyle = {
    overflowX: "auto",
    borderRadius: 12,
    border: "1px solid #ddd3c4",
    background: "#fff",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: isMobile ? 520 : "unset",
  };

  const thStyle = (field) => ({
    padding: "12px 12px",
    textAlign: "left",
    fontFamily: "'Noto Serif TC', serif",
    fontWeight: 600,
    fontSize: 13,
    color: "#8b7d6b",
    borderBottom: "2px solid #ddd3c4",
    background: "#faf5ec",
    cursor: SORTABLE_FIELDS[field] ? "pointer" : "default",
    userSelect: "none",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
  });

  const tdStyle = (isExpanded) => ({
    padding: "14px 12px",
    fontSize: 14,
    borderBottom: isExpanded ? "none" : "1px solid #ddd3c4",
    verticalAlign: "middle",
  });

  const rowStyle = (id, isExpanded) => ({
    background: isExpanded
      ? "#fff9ef"
      : hoveredRow === id
        ? "#faf5ec"
        : "#fff",
    cursor: "pointer",
    transition: "background 0.15s",
  });

  const paginationStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    fontSize: 14,
    color: "#8b7d6b",
  };

  const paginationBtnStyle = (disabled) => ({
    padding: "8px 20px",
    borderRadius: 10,
    border: "1.5px solid #ddd3c4",
    background: disabled ? "#f5efe5" : "#fff",
    color: disabled ? "#c4b9a8" : "#3a2e26",
    fontFamily: "'Noto Sans TC', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s",
  });

  const emptyStyle = {
    textAlign: "center",
    padding: "60px 20px",
    color: "#8b7d6b",
    fontSize: 16,
    fontFamily: "'Noto Serif TC', serif",
  };

  const expandedCellStyle = {
    padding: "0 12px 16px",
    borderBottom: "1px solid #ddd3c4",
    background: "#fff9ef",
  };

  function renderSortArrow(field) {
    if (!SORTABLE_FIELDS[field]) return null;
    if (sort !== field) {
      return (
        <span style={{ marginLeft: 4, opacity: 0.3, fontSize: 11 }}>
          ▲
        </span>
      );
    }
    return (
      <span style={{ marginLeft: 4, fontSize: 11 }}>
        {order === "asc" ? "▲" : "▼"}
      </span>
    );
  }

  function handleThClick(field) {
    if (SORTABLE_FIELDS[field]) {
      onSortChange(field);
    }
  }

  const columns = [
    { key: "created_at", label: "送出時間", hideOnMobile: false },
    { key: "name", label: "姓名", hideOnMobile: false },
    { key: "selected_cats", label: "想領養", hideOnMobile: false },
    { key: "score", label: "評分", hideOnMobile: false },
    { key: "financial", label: "經濟狀況", hideOnMobile: true },
    { key: "ownership", label: "住家", hideOnMobile: true },
  ];

  const visibleColumns = isMobile
    ? columns.filter((c) => !c.hideOnMobile)
    : columns;

  function renderCellValue(app, key) {
    switch (key) {
      case "created_at":
        return formatDate(app.created_at);
      case "name":
        return app.name || "—";
      case "selected_cats":
        return mapCatNames(app.selected_cats);
      case "score":
        return <ScoreBadge score={app.score} />;
      case "financial":
        return app.financial || "—";
      case "ownership":
        return app.ownership || "—";
      default:
        return "—";
    }
  }

  // -- Shimmer keyframes injection --
  useEffect(() => {
    const styleId = "app-table-shimmer";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  return (
    <div style={containerStyle}>
      {/* Top bar: search + filter */}
      <div style={topBarStyle}>
        <input
          type="text"
          placeholder="搜尋姓名或電話..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={searchInputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "#deb970";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd3c4";
          }}
        />
        <select
          value={catFilter}
          onChange={(e) => onCatFilterChange(e.target.value)}
          style={selectStyle}
        >
          {CAT_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={scrollWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  style={thStyle(col.key)}
                  onClick={() => handleThClick(col.key)}
                >
                  {col.label}
                  {renderSortArrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          {loading ? (
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} isMobile={isMobile} />
              ))}
            </tbody>
          ) : applications.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  style={emptyStyle}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>
                    🐱
                  </div>
                  尚無申請資料
                </td>
              </tr>
            </tbody>
          ) : (
            applications.map((app) => {
              const isExpanded = expandedId === app.id;
              return (
                <tbody key={app.id}>
                  <tr
                    style={rowStyle(app.id, isExpanded)}
                    onMouseEnter={() => setHoveredRow(app.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onExpandToggle(app.id)}
                  >
                    {visibleColumns.map((col) => (
                      <td key={col.key} style={tdStyle(isExpanded)}>
                        {renderCellValue(app, col.key)}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={visibleColumns.length}
                        style={expandedCellStyle}
                      >
                        <ApplicationDetail
                          application={app}
                          photoUrls={photoUrls[app.id] || []}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })
          )}
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div style={paginationStyle}>
          <span>
            顯示 {startItem} - {endItem}，共 {total} 筆
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={isFirstPage}
              onClick={() => !isFirstPage && onPageChange(page - 1)}
              style={paginationBtnStyle(isFirstPage)}
            >
              上一頁
            </button>
            <button
              disabled={isLastPage}
              onClick={() => !isLastPage && onPageChange(page + 1)}
              style={paginationBtnStyle(isLastPage)}
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
