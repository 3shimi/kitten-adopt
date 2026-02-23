import { useState, useEffect, useCallback } from "react";
import StatsCards from "./StatsCards.jsx";
import ApplicationTable from "./ApplicationTable.jsx";

const FONT = {
  serif: "'Noto Serif TC', serif",
  sans: "'Noto Sans TC', sans-serif",
};

// --- Login Screen ---

function LoginScreen({ onLogin, error, loading }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #faf5ec 0%, #f3e8d5 40%, #ece0cc 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT.sans,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#fff", borderRadius: 16, padding: "40px 36px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)", maxWidth: 360, width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🐱</div>
        <h1 style={{
          fontFamily: FONT.serif, fontSize: 22, color: "#3a2e26",
          marginBottom: 8, fontWeight: 700,
        }}>
          管理員後台
        </h1>
        <p style={{ fontSize: 14, color: "#8b7d6b", marginBottom: 24 }}>
          請輸入密碼以繼續
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          autoFocus
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10,
            border: "1.5px solid #ddd3c4", background: "rgba(255,255,255,0.7)",
            fontFamily: FONT.sans, fontSize: 15, outline: "none",
            boxSizing: "border-box", marginBottom: 16,
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#c0a87c")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd3c4")}
        />

        {error && (
          <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 28, border: "none",
            background: loading || !password
              ? "#ddd3c4"
              : "linear-gradient(135deg, #deb970, #c0a87c)",
            color: "#fff", fontFamily: FONT.sans, fontSize: 15, fontWeight: 600,
            cursor: loading || !password ? "not-allowed" : "pointer",
            boxShadow: "0 4px 15px rgba(192,168,124,0.35)",
            transition: "all 0.2s", letterSpacing: 1,
          }}
        >
          {loading ? "驗證中..." : "登入"}
        </button>
      </form>
    </div>
  );
}

// --- Main Dashboard ---

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data state
  const [applications, setApplications] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [stats, setStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Table controls
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Check if already has session on mount
  useEffect(() => {
    fetch("/api/admin/applications?limit=1")
      .then(async (res) => {
        if (!res.ok) return;
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) return;
        setAuthed(true);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  // Login handler
  const handleLogin = async (password) => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "登入失敗");
      } else {
        setAuthed(true);
      }
    } catch {
      setLoginError("網路錯誤，請重試");
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setApplications([]);
    setStats(null);
  };

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setDataLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        sort,
        order,
      });
      if (catFilter) params.set("cat", catFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/applications?${params}`);
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setApplications(data.applications || []);
      setPhotoUrls(data.photoUrls || {});
      setPagination((prev) => ({ ...prev, total: data.pagination?.total || 0 }));
    } catch {
      // silent fail, could add error toast later
    } finally {
      setDataLoading(false);
    }
  }, [pagination.page, pagination.limit, sort, order, catFilter, search]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch data when authed or filters change
  useEffect(() => {
    if (authed) {
      fetchApplications();
    }
  }, [authed, fetchApplications]);

  useEffect(() => {
    if (authed) {
      fetchStats();
    }
  }, [authed, fetchStats]);

  // Reset page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [catFilter, search, sort, order]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sort handler
  const handleSortChange = (field) => {
    if (field === sort) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
  };

  // Loading / auth check
  if (authChecking) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #faf5ec 0%, #f3e8d5 40%, #ece0cc 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT.sans, color: "#8b7d6b",
      }}>
        載入中...
      </div>
    );
  }

  if (!authed) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #faf5ec 0%, #f3e8d5 40%, #ece0cc 100%)",
      fontFamily: FONT.sans,
      padding: "24px 16px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24,
        }}>
          <h1 style={{
            fontFamily: FONT.serif, fontSize: 24, color: "#3a2e26",
            fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 10,
          }}>
            🐱 領養申請管理
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 20px", borderRadius: 20,
              border: "1.5px solid #ddd3c4", background: "rgba(255,255,255,0.6)",
              color: "#8b7d6b", fontFamily: FONT.sans, fontSize: 13,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            登出
          </button>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Application Table */}
        <div style={{ marginTop: 24 }}>
          <ApplicationTable
            applications={applications}
            photoUrls={photoUrls}
            loading={dataLoading}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            sort={sort}
            order={order}
            onSortChange={handleSortChange}
            catFilter={catFilter}
            onCatFilterChange={setCatFilter}
            search={searchInput}
            onSearchChange={setSearchInput}
            expandedId={expandedId}
            onExpandToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
          />
        </div>
      </div>
    </div>
  );
}
