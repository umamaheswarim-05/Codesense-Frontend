import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/dashboard";

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const avatarColors = [
  { bg: "#eff6ff", color: "#1d4ed8" },
  { bg: "#fef2f2", color: "#dc2626" },
  { bg: "#fffbeb", color: "#d97706" },
  { bg: "#f0fdf4", color: "#16a34a" },
  { bg: "#faf5ff", color: "#7c3aed" },
];

const errorColors = { Runtime: "#7c3aed", Syntax: "#dc2626", Logic: "#d97706" };
const langColors  = { python: "#3b82f6", java: "#f59e0b", cpp: "#10b981", javascript: "#8b5cf6" };

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [atRisk, setAtRisk]     = useState([]);
  const [errorDist, setErrDist] = useState([]);
  const [langData, setLangData] = useState([]);
  const [loading, setLoading]   = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.firstName ? user.firstName[0] + (user.lastName ? user.lastName[0] : "") : "DR";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, risk, err, lang] = await Promise.all([
          fetch(`${API_URL}/educator/stats`).then(r => r.json()),
          fetch(`${API_URL}/educator/at-risk`).then(r => r.json()),
          fetch(`${API_URL}/educator/errors`).then(r => r.json()),
          fetch(`${API_URL}/educator/languages`).then(r => r.json()),
        ]);
        setStats(s);
        setAtRisk(risk);
        setErrDist(err);
        setLangData(lang);
      } catch (err) {
        console.error("Educator dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const maxErr   = Math.max(...errorDist.map(e => parseInt(e.count)), 1);
  const maxLang  = Math.max(...langData.map(l => parseInt(l.count)), 1);
  const totalErr = errorDist.reduce((sum, e) => sum + parseInt(e.count), 0) || 1;

  const summaryStats = stats ? [
    { label: "Total Students",    value: stats.total_students,     color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    { label: "Submissions Today", value: stats.submissions_today,  color: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
    { label: "At-Risk Students",  value: stats.at_risk_count,      color: "#fef2f2", border: "#fecaca", text: "#dc2626" },
    { label: "Avg Success Rate",  value: `${stats.avg_success_rate}%`, color: "#faf5ff", border: "#e9d5ff", text: "#7c3aed" },
  ] : [];

  if (loading) {
    return (
      <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94a3b8" }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.navbar}>
        <div style={s.logo}>Code<span style={{ color: "#6ee7b7" }}>Sense</span></div>
        <div style={s.navLinks}>
          <span style={s.navLink} onClick={() => navigate("/editor")}>Editor</span>
          <span style={s.navActive}>Dashboard</span>
          <span style={s.navLink} onClick={() => navigate("/dashboard")}>Student View</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={s.avatar}>{initials}</div>
          <span
            style={{ color: "#8892b0", fontSize: "12px", cursor: "pointer" }}
            onClick={() => { localStorage.clear(); navigate("/"); }}
          >
            Logout
          </span>
        </div>
      </div>
      </div>

      <div style={s.content}>
        <div style={s.pageHeader}>
          <div>
            <div style={s.pageTitle}>Educator Dashboard</div>
            <div style={s.pageSubtitle}>Class-wide analytics and student performance overview</div>
          </div>
          <div style={s.dateBox}>
            {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Stat Cards — real data */}
        <div style={s.statsGrid}>
          {summaryStats.map((stat, i) => (
            <div key={i} style={{ ...s.statCard, background: stat.color, border: `1px solid ${stat.border}` }}>
              <div style={{ ...s.statValue, color: stat.text }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={s.row}>
          {/* At-Risk Students table — real ML data */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              At-Risk Students
              <span style={s.mlTag}>ML Predicted</span>
            </div>
            {atRisk.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                No risk predictions yet. ML model has not run for any students.
              </p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>{["Student", "Risk Score", "Level", "Common Error"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {atRisk.map((st, i) => {
                    const av = avatarColors[i % avatarColors.length];
                    const levelStyle = {
                      High:   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
                      Medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
                      Low:    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
                    }[st.risk_level] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
                    return (
                      <tr key={i} style={s.tr}>
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ ...s.avatarSmall, background: av.bg, color: av.color }}>
                              {getInitials(st.name)}
                            </div>
                            <span style={{ fontWeight: "600" }}>{st.name}</span>
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "#f1f5f9", borderRadius: "10px", height: "6px", overflow: "hidden", width: "80px" }}>
                              <div style={{
                                height: "6px", borderRadius: "10px",
                                width: `${st.risk_score}%`,
                                background: levelStyle.color
                              }} />
                            </div>
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{st.risk_score}%</span>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: levelStyle.bg, color: levelStyle.color, border: `1px solid ${levelStyle.border}` }}>
                            {st.risk_level}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: "#64748b", fontSize: "12px" }}>{st.common_error || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Error Distribution + Error Type % — real data */}
          <div style={{ ...s.card, width: "260px", flexShrink: 0, marginBottom: 0 }}>
            <div style={s.cardHeader}>Error Distribution</div>
            {errorDist.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No errors yet.</p>
            ) : (
              errorDist.map((e, i) => (
                <div key={i} style={{ marginBottom: "1.1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{e.error_type}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: errorColors[e.error_type] || "#64748b" }}>{e.count}</span>
                  </div>
                  <div style={s.barBg}>
                    <div style={{ ...s.barFill, width: `${(parseInt(e.count) / maxErr) * 100}%`, background: errorColors[e.error_type] || "#64748b" }} />
                  </div>
                </div>
              ))
            )}

            {errorDist.length > 0 && (
              <div style={{ marginTop: "1.5rem", background: "#f8fafc", borderRadius: "10px", padding: "1rem", border: "1px solid #e2e8f0" }}>
                <div style={s.cardHeader}>Error Type %</div>
                <div style={{ display: "flex", height: "10px", borderRadius: "10px", overflow: "hidden", marginBottom: "12px" }}>
                  {errorDist.map((e, i) => (
                    <div key={i} style={{ flex: parseInt(e.count), background: errorColors[e.error_type] || "#64748b" }} />
                  ))}
                </div>
                {errorDist.map((e, i) => {
                  const pct = Math.round((parseInt(e.count) / totalErr) * 100);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: errorColors[e.error_type] || "#64748b", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "13px", color: "#475569" }}>{e.error_type}</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: errorColors[e.error_type] || "#64748b" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Language Usage — real data */}
        <div style={s.card}>
          <div style={s.cardHeader}>Class Language Usage</div>
          {langData.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>No data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {langData.map((l, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", textTransform: "capitalize" }}>{l.language}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{l.count} submissions</span>
                  </div>
                  <div style={s.barBg}>
                    <div style={{ ...s.barFill, width: `${(parseInt(l.count) / maxLang) * 100}%`, background: langColors[l.language] || "#64748b" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root:         { fontFamily: "'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh" },
  navbar:       { background: "#1a1f36", padding: "0 2rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:         { fontFamily: "monospace", fontSize: "18px", fontWeight: "700", color: "#fff" },
  navLinks:     { display: "flex", gap: "2rem" },
  navLink:      { color: "#8892b0", fontSize: "13px", cursor: "pointer" },
  navActive:    { color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: "600" },
  avatar:       { width: "34px", height: "34px", borderRadius: "50%", background: "#2d3561", color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600" },
  content:      { padding: "2rem" },
  pageHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  pageTitle:    { fontSize: "22px", fontWeight: "700", color: "#1a1f36" },
  pageSubtitle: { color: "#94a3b8", fontSize: "13px", marginTop: "4px" },
  dateBox:      { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", color: "#1a1f36", fontWeight: "500" },
  statsGrid:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "1.5rem" },
  statCard:     { borderRadius: "12px", padding: "1.25rem 1rem", textAlign: "center" },
  statValue:    { fontSize: "30px", fontWeight: "800", marginBottom: "6px" },
  statLabel:    { fontSize: "12px", color: "#64748b", fontWeight: "500" },
  row:          { display: "flex", gap: "16px", marginBottom: "1.5rem" },
  card:         { flex: 1, background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" },
  cardHeader:   { fontSize: "14px", fontWeight: "700", color: "#1a1f36", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" },
  mlTag:        { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { fontSize: "11px", color: "#94a3b8", fontWeight: "600", textAlign: "left", padding: "8px", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" },
  tr:           { borderBottom: "1px solid #f8fafc" },
  td:           { fontSize: "13px", color: "#1a1f36", padding: "10px 8px" },
  avatarSmall:  { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", flexShrink: 0 },
  barBg:        { background: "#f1f5f9", borderRadius: "10px", height: "8px", overflow: "hidden" },
  barFill:      { height: "8px", borderRadius: "10px" },
};