import { useState, useEffect } from "react";

const CAT_NAMES = {
  siamese1: "小暹羅 1 號",
  siamese2: "小暹羅 2 號",
  black3: "小黑咖 3 號",
  duo: "暹羅兩姐妹",
  trio: "三姐妹",
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

/* ─── Design tokens ─── */
const COLORS = {
  bg: "#faf5ec",
  gold: "#deb970",
  accent: "#c0a87c",
  textDark: "#3a2e26",
  textLight: "#8b7d6b",
  border: "#ddd3c4",
  lightBg: "#fff9ef",
  positive: "#4a8c5c",
  negative: "#c0392b",
  neutral: "#aaa29a",
};

const FONT = {
  heading: "'Noto Serif TC', serif",
  body: "'Noto Sans TC', sans-serif",
};

/* ─── Helpers ─── */

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: `1px solid ${COLORS.border}`,
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: FONT.heading,
          fontWeight: 600,
          fontSize: 14,
          color: COLORS.textLight,
          flexShrink: 0,
          minWidth: 90,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: FONT.body,
          fontSize: 14,
          color: COLORS.textDark,
          fontWeight: 500,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h3
      style={{
        fontFamily: FONT.heading,
        fontSize: 16,
        fontWeight: 700,
        color: COLORS.textDark,
        margin: "24px 0 4px",
        paddingBottom: 8,
        borderBottom: `2px solid ${COLORS.gold}`,
      }}
    >
      {title}
    </h3>
  );
}

function ScoreCircle({ total, max }) {
  const percentage = Math.max(0, Math.min(100, (total / max) * 100));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 70) return COLORS.positive;
    if (percentage >= 40) return COLORS.gold;
    return COLORS.negative;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          {/* Background circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke={COLORS.border}
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT.heading,
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.textDark,
              lineHeight: 1,
            }}
          >
            {total}
          </span>
          <span
            style={{
              fontFamily: FONT.body,
              fontSize: 13,
              color: COLORS.textLight,
              marginTop: 2,
            }}
          >
            / {max}
          </span>
        </div>
      </div>
    </div>
  );
}

function BreakdownTable({ breakdown }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: 0,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Header */}
        <div style={headerCellStyle}>評分項目</div>
        <div style={headerCellStyle}>填寫內容</div>
        <div style={{ ...headerCellStyle, textAlign: "right" }}>分數</div>

        {/* Rows */}
        {breakdown.map((item, i) => {
          const isLast = i === breakdown.length - 1;
          const pointColor =
            item.points > 0
              ? COLORS.positive
              : item.points < 0
                ? COLORS.negative
                : COLORS.neutral;

          const cellBase = {
            padding: "10px 12px",
            fontSize: 13,
            fontFamily: FONT.body,
            borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
            background: i % 2 === 0 ? "#fff" : COLORS.lightBg,
          };

          return [
            <div key={`l-${i}`} style={{ ...cellBase, color: COLORS.textDark, fontWeight: 500 }}>
              {item.label}
            </div>,
            <div key={`v-${i}`} style={{ ...cellBase, color: COLORS.textLight, wordBreak: "break-word" }}>
              {formatBreakdownValue(item.field, item.value)}
            </div>,
            <div
              key={`p-${i}`}
              style={{
                ...cellBase,
                textAlign: "right",
                fontWeight: 700,
                color: pointColor,
                minWidth: 48,
              }}
            >
              {item.points > 0 ? `+${item.points}` : item.points}
            </div>,
          ];
        })}
      </div>
    </div>
  );
}

const headerCellStyle = {
  padding: "10px 12px",
  fontSize: 12,
  fontFamily: FONT.heading,
  fontWeight: 700,
  color: COLORS.textLight,
  background: COLORS.lightBg,
  borderBottom: `2px solid ${COLORS.border}`,
};

function formatBreakdownValue(field, value) {
  if (field === "selected_cats") {
    try {
      const cats = typeof value === "string" ? JSON.parse(value) : value;
      if (Array.isArray(cats)) {
        return cats.map((id) => CAT_NAMES[id] || id).join("、");
      }
    } catch {
      // fall through
    }
  }
  return value || "—";
}

function PhotoGallery({ photoUrls }) {
  if (!photoUrls || photoUrls.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <h4
        style={{
          fontFamily: FONT.heading,
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.textDark,
          marginBottom: 12,
          marginTop: 0,
        }}
      >
        上傳照片
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 10,
        }}
      >
        {photoUrls.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block" }}
          >
            <div
              style={{
                width: "100%",
                paddingTop: "100%",
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                border: `1px solid ${COLORS.border}`,
                cursor: "pointer",
              }}
            >
              <img
                src={url}
                alt={`上傳照片 ${i + 1}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mapCatNames(selectedCats) {
  if (!selectedCats || !Array.isArray(selectedCats) || selectedCats.length === 0) return "—";
  return selectedCats.map((id) => CAT_NAMES[id] || id).join("、");
}

function formatPets(application) {
  const parts = [];
  if (application.has_dog) {
    parts.push(`狗 ${application.dog_count || "?"} 隻`);
  }
  if (application.has_cat) {
    parts.push(`貓 ${application.cat_count || "?"} 隻`);
  }
  if (application.has_other) {
    parts.push(application.other_detail || "其他動物");
  }
  return parts.length > 0 ? parts.join("、") : "無";
}

/* ─── Main component ─── */

export default function ApplicationDetail({ application, photoUrls = [] }) {
  const mobile = useIsMobile();

  if (!application) return null;

  const app = application;
  const score = app.score;

  const columnStyle = {
    flex: 1,
    minWidth: 0,
  };

  const panelStyle = {
    background: "#fff",
    borderRadius: 12,
    padding: mobile ? "20px 16px" : "24px 24px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 2px 12px rgba(90,70,48,0.06)",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        gap: 24,
        fontFamily: FONT.body,
        color: COLORS.textDark,
      }}
    >
      {/* ─── Left column: 申請資訊 ─── */}
      <div style={columnStyle}>
        <div style={panelStyle}>
          <h2
            style={{
              fontFamily: FONT.heading,
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.textDark,
              margin: "0 0 8px",
            }}
          >
            申請資訊
          </h2>

          {/* 基本資料 */}
          <SectionHeader title="基本資料" />
          <InfoRow label="姓名" value={app.name} />
          <InfoRow label="性別" value={app.gender} />
          <InfoRow label="年齡" value={app.age != null ? `${app.age} 歲` : null} />
          <InfoRow label="手機/LINE" value={app.phone} />
          <InfoRow label="經濟狀況" value={app.financial} />

          {/* 居住環境 */}
          <SectionHeader title="居住環境" />
          <InfoRow label="住家" value={app.ownership} />
          {app.landlord_ok != null && (
            <InfoRow label="房東同意" value={app.landlord_ok} />
          )}
          <InfoRow label="紗窗/防墜網" value={app.screen_installed} />
          <InfoRow label="家人同意" value={app.family_agree} />

          {/* 養寵經驗 */}
          <SectionHeader title="養寵經驗" />
          <InfoRow label="養過貓" value={app.has_cat_before} />
          {app.cat_detail != null && (
            <InfoRow label="養貓經歷" value={app.cat_detail} />
          )}
          <InfoRow label="現有寵物" value={formatPets(app)} />

          {/* 其他 */}
          <SectionHeader title="其他" />
          <InfoRow label="外出方式" value={app.outdoor} />
          <InfoRow label="想領養的貓" value={mapCatNames(app.selected_cats)} />

          {/* 送出時間 */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: `1px solid ${COLORS.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: FONT.heading,
                fontWeight: 600,
                fontSize: 13,
                color: COLORS.textLight,
              }}
            >
              送出時間
            </span>
            <span
              style={{
                fontFamily: FONT.body,
                fontSize: 13,
                color: COLORS.textLight,
              }}
            >
              {formatTimestamp(app.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Right column: 評分明細 ─── */}
      <div style={columnStyle}>
        <div style={panelStyle}>
          <h2
            style={{
              fontFamily: FONT.heading,
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.textDark,
              margin: "0 0 20px",
            }}
          >
            評分明細
          </h2>

          {score && (
            <>
              <ScoreCircle total={score.total} max={score.max} />
              <BreakdownTable breakdown={score.breakdown} />
            </>
          )}

          <PhotoGallery photoUrls={photoUrls} />
        </div>
      </div>
    </div>
  );
}
