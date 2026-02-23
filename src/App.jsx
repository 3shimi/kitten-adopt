import { useState, useRef, useEffect, useCallback } from "react";

function useIsMobile(breakpoint = 480) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= breakpoint);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

const CAT_IMAGES = {
  siamese1: "/cats/siamese1.jpg",
  siamese2: "/cats/siamese2.jpg",
  black3: "/cats/black3.jpg",
  duo: "/cats/duo.jpg",
  trio: "/cats/trio.jpg",
};

const CAT_AVATARS = {
  siamese1: "/cats/siamese1-avatar.jpg",
  siamese2: "/cats/siamese2-avatar.jpg",
  black3: "/cats/black3-avatar.jpg",
};

const STEPS = ["intro", "catSelection", "info", "experience", "done"];

const STEP_LABELS = {
  catSelection: "選擇貓咪",
  info: "基本資料",
  experience: "養貓經驗",
};

const INDIVIDUAL_CATS = [
  { id: "siamese1", name: "小暹羅 1 號", img: "siamese1", weight: "0.75 公斤", desc: "穿白襪子的小暹羅，小女生" },
  { id: "siamese2", name: "小暹羅 2 號", img: "siamese2", weight: "0.45 公斤", desc: "穿黑襪子的小暹羅，小女生" },
  { id: "black3", name: "小黑咖 3 號", img: "black3", weight: "0.45 公斤", desc: "帶咖啡色的黑貓，小女生" },
];

const COMBO_OPTIONS = [
  { id: "trio", name: "三姐妹一起領養", img: "trio", desc: "小暹羅 1 號 + 小暹羅 2 號 + 小黑咖 3 號", badge: "最佳", badgeColor: "#c0392b" },
  { id: "duo", name: "暹羅兩姐妹一起領養", img: "duo", desc: "小暹羅 1 號 + 小暹羅 2 號", badge: "推薦", badgeColor: "#d4a85c" },
];

function FloatingPaws() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ position: "absolute", fontSize: `${18 + Math.random() * 24}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.06, transform: `rotate(${Math.random() * 360}deg)` }}>
          🐾
        </div>
      ))}
    </div>
  );
}

function CatCard({ cat, selected, onToggle, isCombo, mobile }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", borderRadius: mobile ? 12 : 16, overflow: "hidden",
        border: selected ? "3px solid #d4a85c" : "2px solid #e8ddd0",
        background: selected ? "linear-gradient(135deg, #fff9ef, #f5ead6)" : "#fff",
        cursor: "pointer", transition: "all 0.3s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: selected ? "0 8px 25px rgba(212,168,92,0.3)" : hover ? "0 6px 20px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,0,0,0.06)",
        flex: mobile ? "0 0 auto" : isCombo ? "1 1 calc(50% - 8px)" : "1 1 calc(33.33% - 11px)",
        minWidth: mobile ? "auto" : isCombo ? 0 : 150,
        maxWidth: mobile ? "100%" : isCombo ? "none" : 220,
        boxSizing: "border-box",
      }}
    >
      {cat.badge && (
        <div style={{ position: "absolute", top: 10, right: 10, background: cat.badgeColor, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, zIndex: 2, letterSpacing: 1, fontFamily: "'Noto Sans TC', sans-serif" }}>
          {cat.badge}
        </div>
      )}
      <div style={{ position: "relative", paddingTop: mobile ? "60%" : isCombo ? "75%" : "100%", overflow: "hidden" }}>
        <img src={CAT_IMAGES[cat.img]} alt={cat.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hover ? "scale(1.05)" : "scale(1)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: selected ? "2px solid #d4a85c" : "2px solid #ccc", background: selected ? "#d4a85c" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
            {selected && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontFamily: "'Noto Serif TC', serif", fontWeight: 700, fontSize: 15, color: "#3a2e26" }}>{cat.name}</span>
        </div>
        <p style={{ fontSize: 12, color: "#8b7d6b", margin: "4px 0 0", lineHeight: 1.5, paddingLeft: 28 }}>{cat.desc}</p>
        {cat.weight && <p style={{ fontSize: 11, color: "#a08c6e", margin: "2px 0 0", paddingLeft: 28 }}>體重：{cat.weight}</p>}
      </div>
    </div>
  );
}

function PhotoUploader({ label, photos, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const handleFiles = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => onUpload({ name: file.name, url: ev.target.result, file });
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <span style={{ fontFamily: "'Noto Serif TC', serif", fontWeight: 600, fontSize: 14, color: "#3a2e26" }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position: "relative", width: 100, height: 100, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={() => onRemove(i)} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
          </div>
        ))}
        <button onClick={() => inputRef.current?.click()} style={{ width: 100, height: 100, borderRadius: 12, border: "2px dashed #d4c5b0", background: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "#a08c6e", fontSize: 13 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>📷</span>
          <span>上傳</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
    </div>
  );
}

function InputField({ label, required, type = "text", placeholder, value, onChange, ...rest }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "'Noto Serif TC', serif", fontWeight: 600, fontSize: 14, color: "#3a2e26", marginBottom: 5 }}>
        {label} {required && <span style={{ color: "#c0392b", fontSize: 12 }}>*</span>}
      </label>
      {type === "textarea" ? (
        <textarea placeholder={placeholder} value={value} onChange={onChange} rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #ddd3c4", background: "rgba(255,255,255,0.7)", fontFamily: "'Noto Sans TC', sans-serif", fontSize: 14, resize: "vertical", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }} onFocus={(e) => (e.target.style.borderColor = "#c0a87c")} onBlur={(e) => (e.target.style.borderColor = "#ddd3c4")} {...rest} />
      ) : (
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #ddd3c4", background: "rgba(255,255,255,0.7)", fontFamily: "'Noto Sans TC', sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }} onFocus={(e) => (e.target.style.borderColor = "#c0a87c")} onBlur={(e) => (e.target.style.borderColor = "#ddd3c4")} {...rest} />
      )}
    </div>
  );
}

function RadioGroup({ label, required, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "'Noto Serif TC', serif", fontWeight: 600, fontSize: 14, color: "#3a2e26", marginBottom: 8 }}>
        {label} {required && <span style={{ color: "#c0392b", fontSize: 12 }}>*</span>}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => (
          <button key={opt} onClick={() => onChange(opt)} style={{ padding: "8px 18px", borderRadius: 20, border: value === opt ? "2px solid #c0a87c" : "1.5px solid #ddd3c4", background: value === opt ? "linear-gradient(135deg, #f5e6c8, #edd9b5)" : "rgba(255,255,255,0.5)", color: value === opt ? "#5a4630" : "#8b7d6b", fontFamily: "'Noto Sans TC', sans-serif", fontSize: 14, fontWeight: value === opt ? 600 : 400, cursor: "pointer", transition: "all 0.2s", boxShadow: value === opt ? "0 2px 8px rgba(192,168,124,0.25)" : "none" }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}


function ProgressBar({ step }) {
  const formSteps = STEPS.filter((s) => s !== "intro" && s !== "done");
  const idx = formSteps.indexOf(step);
  const pct = step === "done" ? 100 : step === "intro" ? 0 : ((idx + 1) / formSteps.length) * 100;
  if (step === "intro" || step === "done") return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#8b7d6b", fontFamily: "'Noto Sans TC', sans-serif" }}>{STEP_LABELS[step]}</span>
        <span style={{ fontSize: 13, color: "#a08c6e" }}>{idx + 1} / {formSteps.length}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "#e8ddd0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #deb970, #c0a87c)", borderRadius: 3, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

export default function CatAdoptionForm() {
  const mobile = useIsMobile();
  const [step, setStep] = useState("intro");
  const [fadeIn, setFadeIn] = useState(true);
  const [selectedCats, setSelectedCats] = useState([]);

  const [form, setForm] = useState({
    name: "", gender: "", age: "", phone: "", financial: "",
    ownership: "", landlordOk: "", screenInstalled: "", familyAgree: "",
    hasCatBefore: "", catDetail: "",
    hasDog: false, dogCount: "", hasCat: false, catCount: "", hasOther: false, otherDetail: "",
    outdoor: "", lifeChangePlan: "",
  });

  const [photos, setPhotos] = useState({ pets: [] });

  const containerRef = useRef(null);

  useEffect(() => { setFadeIn(false); const t = setTimeout(() => setFadeIn(true), 50); return () => clearTimeout(t); }, [step]);
  useEffect(() => { if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const u = (field) => (e) => setForm((p) => ({ ...p, [field]: e?.target?.value ?? e }));
  const addPhoto = (cat) => (photo) => setPhotos((p) => ({ ...p, [cat]: [...p[cat], photo] }));
  const removePhoto = (cat) => (i) => setPhotos((p) => ({ ...p, [cat]: p[cat].filter((_, j) => j !== i) }));

  const toggleCat = (catId) => {
    setSelectedCats((prev) => prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]);
  };

  const getSelectionSummary = () => {
    return selectedCats.map((id) => {
      const cat = [...INDIVIDUAL_CATS, ...COMBO_OPTIONS].find((c) => c.id === id);
      return cat?.name;
    }).filter(Boolean).join("、");
  };

  const nav = (dir) => { const i = STEPS.indexOf(step); setStep(STEPS[i + dir]); };

  const pageStyle = { opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" };
  const cardStyle = { background: "rgba(255,252,245,0.85)", backdropFilter: "blur(12px)", borderRadius: 20, padding: mobile ? "24px 16px" : "32px 28px", boxShadow: "0 8px 40px rgba(90,70,48,0.08), 0 1px 3px rgba(90,70,48,0.06)", border: "1px solid rgba(221,211,196,0.5)", maxWidth: 620, width: "100%", margin: "0 auto", position: "relative", zIndex: 1, boxSizing: "border-box" };
  const btnPrimary = { padding: "12px 36px", borderRadius: 28, border: "none", background: "linear-gradient(135deg, #deb970, #c0a87c)", color: "#fff", fontFamily: "'Noto Sans TC', sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 15px rgba(192,168,124,0.35)", transition: "all 0.2s", letterSpacing: 1 };
  const btnSecondary = { padding: "12px 28px", borderRadius: 28, border: "1.5px solid #ddd3c4", background: "rgba(255,255,255,0.6)", color: "#8b7d6b", fontFamily: "'Noto Sans TC', sans-serif", fontSize: 14, cursor: "pointer", transition: "all 0.2s" };

  const sectionTitle = (emoji, text) => (
    <h2 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 20, color: "#3a2e26", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 28 }}>{emoji}</span> {text}
    </h2>
  );

  const navButtons = (nextDisabled = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
      <button onClick={() => nav(-1)} style={btnSecondary}>← 上一步</button>
      <button onClick={() => nav(1)} disabled={nextDisabled} style={{ ...btnPrimary, opacity: nextDisabled ? 0.5 : 1, cursor: nextDisabled ? "not-allowed" : "pointer" }}>
        下一步 →
      </button>
    </div>
  );

  return (
    <div ref={containerRef} style={{ minHeight: "100vh", background: "linear-gradient(160deg, #faf5ec 0%, #f3e8d5 40%, #ece0cc 100%)", fontFamily: "'Noto Sans TC', sans-serif", padding: mobile ? "20px 10px" : "40px 16px", position: "relative", overflowY: "auto" }}>
      <FloatingPaws />

      <div style={pageStyle}>
        {step === "intro" && (
          <div style={{ ...cardStyle, textAlign: "center", padding: mobile ? "36px 20px" : "56px 36px" }}>
            <h1 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: mobile ? 24 : 34, fontWeight: 700, color: "#3a2e26", marginBottom: 16, letterSpacing: 2 }}>
              暹羅與小黑咖 領養申請表
            </h1>
            <p style={{ color: "#8b7d6b", fontSize: mobile ? 16 : 18, lineHeight: 1.8, margin: "0 0 28px" }}>
              三隻小姐妹正在等一個溫暖的家 🏠
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 10 : 28, marginBottom: mobile ? 28 : 36, flexWrap: "wrap" }}>
              {INDIVIDUAL_CATS.map((cat) => (
                <div key={cat.id} style={{ width: mobile ? 90 : 120, textAlign: "center" }}>
                  <div style={{ width: mobile ? 90 : 120, height: mobile ? 90 : 120, borderRadius: "50%", overflow: "hidden", border: "3px solid #e8ddd0", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", boxSizing: "border-box" }}>
                    <img src={CAT_AVATARS[cat.img]} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <p style={{ fontSize: mobile ? 14 : 15, color: "#5a4630", marginTop: 10, fontWeight: 600 }}>{cat.name}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setStep("catSelection")} style={{ ...btnPrimary, padding: "16px 56px", fontSize: mobile ? 17 : 18 }}>
              我想領養 🐾
            </button>
          </div>
        )}

        {step === "catSelection" && (
          <div style={{ ...cardStyle, maxWidth: mobile ? 620 : 700 }}>
            <ProgressBar step={step} />
            {sectionTitle("🐱", "想領養誰？")}
            <p style={{ fontSize: 13, color: "#8b7d6b", marginBottom: 20, lineHeight: 1.6 }}>
              💡 姐妹一起領養可以互相作伴，適應更快！
            </p>

            <h3 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 15, color: "#5a4630", marginBottom: 12 }}>一起領養</h3>
            <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", flexWrap: mobile ? "nowrap" : "wrap", gap: mobile ? 12 : 16, marginBottom: 24 }}>
              {COMBO_OPTIONS.map((cat) => (
                <CatCard key={cat.id} cat={cat} selected={selectedCats.includes(cat.id)} onToggle={() => toggleCat(cat.id)} isCombo mobile={mobile} />
              ))}
            </div>

            <h3 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 15, color: "#5a4630", marginBottom: 12 }}>單獨領養</h3>
            <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", flexWrap: mobile ? "nowrap" : "wrap", gap: mobile ? 12 : 16, marginBottom: 16 }}>
              {INDIVIDUAL_CATS.map((cat) => (
                <CatCard key={cat.id} cat={cat} selected={selectedCats.includes(cat.id)} onToggle={() => toggleCat(cat.id)} mobile={mobile} />
              ))}
            </div>

            {selectedCats.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, rgba(212,168,92,0.15), rgba(192,168,124,0.1))", borderRadius: 14, padding: "12px 16px", marginTop: 16, border: "1px solid rgba(212,168,92,0.3)" }}>
                <p style={{ fontSize: 14, color: "#5a4630", margin: 0, fontWeight: 500 }}>🐾 已選：{getSelectionSummary()}</p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => setStep("intro")} style={btnSecondary}>← 回首頁</button>
              <button onClick={() => nav(1)} disabled={selectedCats.length === 0} style={{ ...btnPrimary, opacity: selectedCats.length === 0 ? 0.5 : 1, cursor: selectedCats.length === 0 ? "not-allowed" : "pointer" }}>
                下一步 →
              </button>
            </div>
          </div>
        )}

        {step === "info" && (
          <div style={cardStyle}>
            <ProgressBar step={step} />
            {sectionTitle("📝", "基本資料")}
            <InputField label="姓名" required value={form.name} onChange={u("name")} placeholder="真實姓名" />
            <RadioGroup label="性別" required options={["男", "女", "其他"]} value={form.gender} onChange={u("gender")} />
            <InputField label="年齡" required type="number" value={form.age} onChange={u("age")} placeholder="請輸入年齡" />
            <InputField label="手機 或 LINE" required value={form.phone} onChange={u("phone")} placeholder="方便我們聯繫你" />
            <RadioGroup label="是否有穩定收入可負擔貓咪日常開銷與醫療費用？" required options={["有穩定收入", "有家人支援", "目前沒有"]} value={form.financial} onChange={u("financial")} />
            <RadioGroup label="住家是自有還是租屋？" required options={["自有", "租屋"]} value={form.ownership} onChange={u("ownership")} />
            {form.ownership === "租屋" && (
              <RadioGroup label="房東同意養寵物嗎？" required options={["同意", "尚未詢問"]} value={form.landlordOk} onChange={u("landlordOk")} />
            )}
            <RadioGroup label="紗窗 / 防墜網？" required options={["已安裝", "願意安裝", "無法安裝"]} value={form.screenInstalled} onChange={u("screenInstalled")} />
            <RadioGroup label="同住的人都同意養貓嗎？" required options={["全部同意", "還在溝通"]} value={form.familyAgree} onChange={u("familyAgree")} />
            {navButtons()}
          </div>
        )}

        {step === "experience" && (
          <div style={cardStyle}>
            <ProgressBar step={step} />
            {sectionTitle("😺", "養貓經驗")}
            <RadioGroup label="養過貓嗎？" required options={["有", "沒有，但有做功課", "完全沒有"]} value={form.hasCatBefore} onChange={u("hasCatBefore")} />
            {form.hasCatBefore === "有" && (
              <InputField label="簡單說說你的養貓經歷" type="textarea" value={form.catDetail} onChange={u("catDetail")} placeholder="養了多久、貓咪現在的狀況等" />
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontFamily: "'Noto Serif TC', serif", fontWeight: 600, fontSize: 14, color: "#3a2e26", marginBottom: 8 }}>
                目前家中有其他寵物嗎？（可複選）
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[["hasDog", "🐶 狗狗"], ["hasCat", "🐱 貓咪"], ["hasOther", "🐾 其他"]].map(([key, label]) => (
                  <button key={key} onClick={() => setForm((p) => ({ ...p, [key]: !p[key] }))} style={{ padding: "8px 18px", borderRadius: 20, border: form[key] ? "2px solid #c0a87c" : "1.5px solid #ddd3c4", background: form[key] ? "linear-gradient(135deg, #f5e6c8, #edd9b5)" : "rgba(255,255,255,0.5)", color: form[key] ? "#5a4630" : "#8b7d6b", fontFamily: "'Noto Sans TC', sans-serif", fontSize: 14, fontWeight: form[key] ? 600 : 400, cursor: "pointer", transition: "all 0.2s", boxShadow: form[key] ? "0 2px 8px rgba(192,168,124,0.25)" : "none" }}>
                    {label}
                  </button>
                ))}
              </div>
              {form.hasDog && (
                <div style={{ marginTop: 10 }}>
                  <InputField label="🐶 狗狗幾隻？" value={form.dogCount} onChange={u("dogCount")} placeholder="例：1" />
                </div>
              )}
              {form.hasCat && (
                <div style={{ marginTop: form.hasDog ? 0 : 10 }}>
                  <InputField label="🐱 貓咪幾隻？" value={form.catCount} onChange={u("catCount")} placeholder="例：2" />
                </div>
              )}
              {form.hasOther && (
                <div style={{ marginTop: (form.hasDog || form.hasCat) ? 0 : 10 }}>
                  <InputField label="🐾 什麼動物？幾隻？" value={form.otherDetail} onChange={u("otherDetail")} placeholder="例：兔子 1 隻、倉鼠 2 隻" />
                </div>
              )}
              {(form.hasDog || form.hasCat || form.hasOther) && (
                <div style={{ marginTop: 4 }}>
                  <PhotoUploader label="有可愛的照片想分享嗎？（非必填）" photos={photos.pets} onUpload={addPhoto("pets")} onRemove={removePhoto("pets")} />
                </div>
              )}
            </div>

            <RadioGroup label="會讓貓咪外出嗎？" required options={["完全室內", "偶爾外出（有牽繩）", "自由進出"]} value={form.outdoor} onChange={u("outdoor")} />
            <InputField label="如果未來搬家或有人生變動，貓咪怎麼辦？" required type="textarea" value={form.lifeChangePlan} onChange={u("lifeChangePlan")} placeholder="簡單說明你的想法" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => nav(-1)} style={btnSecondary}>← 上一步</button>
              <button onClick={() => setStep("done")} style={{ ...btnPrimary, background: "linear-gradient(135deg, #d4a85c, #b8944e)" }}>
                送出申請 🎉
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ ...cardStyle, textAlign: "center", padding: mobile ? "32px 16px" : "48px 28px" }}>
            <div style={{ fontSize: mobile ? 56 : 72, marginBottom: 16 }}>🎊</div>
            <h2 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 24, color: "#3a2e26", marginBottom: 12 }}>謝謝你！已收到申請</h2>
            {selectedCats.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, rgba(212,168,92,0.15), rgba(192,168,124,0.1))", borderRadius: 14, padding: "14px 18px", marginBottom: 20, border: "1px solid rgba(212,168,92,0.3)", display: "inline-block" }}>
                <p style={{ fontSize: 14, color: "#5a4630", margin: 0, fontWeight: 500 }}>🐾 你想領養：{getSelectionSummary()}</p>
              </div>
            )}
            <p style={{ color: "#a08c6e", fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
              我們會盡快挑選合適的領養人，並透過電話或 LINE 聯繫你！<br />
              <span style={{ fontSize: 13 }}>請耐心等候，感謝你給浪浪一個機會 🐾</span>
            </p>
            <button onClick={() => { setStep("intro"); setSelectedCats([]); setForm(Object.fromEntries(Object.keys(form).map(k=>[k,""]))); setPhotos({pets:[]}); }} style={btnSecondary}>
              重新填寫
            </button>
          </div>
        )}
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "#bfb199", marginTop: 40, position: "relative", zIndex: 1 }}>
        © 2026 暹羅與小黑咖領養計畫
      </p>
    </div>
  );
}
