import { useState, useEffect } from "react";

const CAT_NAMES = {
  siamese1: "小暹羅 1 號", siamese2: "小暹羅 2 號", black3: "小黑咖 3 號",
  duo: "暹羅兩姐妹", trio: "三姐妹",
};
const CAT_COLORS = {
  siamese1: "#deb970", siamese2: "#c0a87c", black3: "#6b5b4e",
  duo: "#b8956a", trio: "#c0392b",
};

const SANS = "'Noto Sans TC', sans-serif";
const SERIF = "'Noto Serif TC', serif";
const SHADOW = "0 2px 10px rgba(0,0,0,0.06)";
const BORDER = "1px solid #ddd3c4";
const PULSE_CSS = `@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`;

const card = (m) => ({
  flex: m ? "1 1 100%" : "1 1 0", background: "#fff", borderRadius: 14,
  padding: m ? "18px 16px" : "22px 24px", boxShadow: SHADOW, border: BORDER,
});
const row = (m) => ({ display: "flex", flexDirection: m ? "column" : "row", gap: 14 });
const sectionTitle = { fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: "#3a2e26", marginBottom: 16 };

function useIsTablet(bp = 768) {
  const [v, setV] = useState(() => typeof window !== "undefined" && window.innerWidth <= bp);
  useEffect(() => {
    const c = () => setV(window.innerWidth <= bp);
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, [bp]);
  return v;
}

function Skel({ width = "100%", height = 20 }) {
  return <div style={{ width, height, borderRadius: 8, background: "#e8ddd0", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

function StatCard({ label, value, mobile }) {
  return (
    <div style={{ ...card(mobile), textAlign: "center" }}>
      <div style={{ fontFamily: SANS, fontSize: 13, color: "#8b7d6b", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: "#3a2e26" }}>{value}</div>
    </div>
  );
}

export default function StatsCards({ stats, loading }) {
  const m = useIsTablet();

  if (loading) {
    return (
      <>
        <style>{PULSE_CSS}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={row(m)}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ ...card(m), display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Skel width={80} height={14} /><Skel width={60} height={32} />
              </div>
            ))}
          </div>
          <div style={row(m)}>
            {[1, 2].map((i) => (
              <div key={i} style={{ ...card(false) }}>
                <Skel width={100} height={16} />
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3].map((j) => <Skel key={j} height={18} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const { total, byCat = {}, avgScore, maxScore, minScore, byDate = [] } = stats || {};
  const maxCat = Math.max(...Object.values(byCat), 1);
  const recent = byDate.slice(-14);
  const maxDay = Math.max(...recent.map((d) => d.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={row(m)}>
        <StatCard label="總申請數" value={total ?? 0} mobile={m} />
        <StatCard label="平均分數" value={avgScore != null ? avgScore.toFixed(1) : "—"} mobile={m} />
        <StatCard label="最高 / 最低分" value={`${maxScore ?? "—"} / ${minScore ?? "—"}`} mobile={m} />
      </div>

      <div style={row(m)}>
        {/* 各貓熱門度 */}
        <div style={card(false)}>
          <div style={sectionTitle}>各貓熱門度</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(CAT_NAMES).map(([k, name]) => {
              const cnt = byCat[k] || 0;
              const pct = (cnt / maxCat) * 100;
              return (
                <div key={k}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 13, color: "#3a2e26", marginBottom: 4 }}>
                    <span>{name}</span><span style={{ color: "#8b7d6b" }}>{cnt}</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: "#f3e8d5", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 5, background: CAT_COLORS[k], transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 申請趨勢 */}
        <div style={card(false)}>
          <div style={sectionTitle}>申請趨勢</div>
          {recent.length === 0 ? (
            <div style={{ fontFamily: SANS, fontSize: 13, color: "#8b7d6b", textAlign: "center", padding: "20px 0" }}>
              尚無資料
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
                {recent.map((d) => (
                  <div key={d.date} title={`${d.date}: ${d.count} 筆`} style={{ flex: "1 1 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "100%", height: Math.max((d.count / maxDay) * 70, 3), borderRadius: 3, background: "#deb970", transition: "height 0.4s ease" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 10, color: "#8b7d6b", marginTop: 6 }}>
                <span>{recent[0]?.date.slice(5)}</span>
                <span>{recent[recent.length - 1]?.date.slice(5)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
