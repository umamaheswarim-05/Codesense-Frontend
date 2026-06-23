import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/dashboard";

function getErrorTypeBadge(errorStr) {
  if (!errorStr) return null;
  const e = errorStr.toLowerCase();
  if (e.includes("syntax"))  return { label: "Syntax",  bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
  if (e.includes("null") || e.includes("runtime") || e.includes("index"))
                             return { label: "Runtime", bg: "#fffbeb", color: "#d97706", border: "#fde68a" };
  if (e.includes("logic"))   return { label: "Logic",   bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
  return                            { label: "Error",   bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

const errorColors = { Runtime: "#7c3aed", Syntax: "#dc2626", Logic: "#d97706" };
const langColors  = { python: "#3b82f6", java: "#f59e0b", cpp: "#10b981", javascript: "#8b5cf6" };

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]      = useState(null);
  const [submissions, setSubm] = useState([]);
  const [errorData, setErrors] = useState([]);
  const [langData, setLangs]   = useState([]);
  const [loading, setLoading]  = useState(true);

  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const userId   = user.id || 1;
  const userName = user.firstName || "Uma";
  const initials = user.firstName ? user.firstName[0] + (user.lastName ? user.lastName[0] : "") : "UM";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, sub, err, lang] = await Promise.all([
          fetch(`${API_URL}/stats/${userId}`).then(r => r.json()),
          fetch(`${API_URL}/submissions/${userId}`).then(r => r.json()),
          fetch(`${API_URL}/errors/${userId}`).then(r => r.json()),
          fetch(`${API_URL}/languages/${userId}`).then(r => r.json()),
        ]);
        setStats(s);
        setSubm(sub);
        setErrors(err);
        setLangs(lang);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  const riskScore = stats ? Math.min(100, Math.round((stats.errors_detected / Math.max(stats.total_submissions, 1)) * 100)) : 0;
  const riskLevel = riskScore >= 60 ? "High Risk" : riskScore >= 30 ? "Medium Risk" : "Low Risk";
  const riskColor = riskScore >= 60 ? "#dc2626" : riskScore >= 30 ? "#7c3aed" : "#16a34a";
  const riskBg    = riskScore >= 60 ? "#fef2f2" : riskScore >= 30 ? "#faf5ff" : "#f0fdf4";
  const riskBorder= riskScore >= 60 ? "#fecaca" : riskScore >= 30 ? "#e9d5ff" : "#bbf7d0";
  const maxError  = Math.max(...errorData.map(e => parseInt(e.count)), 1);
  const maxLang   = Math.max(...langData.map(l => parseInt(l.count)), 1);

  const statCards = stats ? [
    { label: "Total Submissions", value: stats.total_submissions, color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    { label: "Successful Runs",   value: stats.successful_runs,   color: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
    { label: "Errors Detected",   value: stats.errors_detected,   color: "#fef2f2", border: "#fecaca", text: "#dc2626" },
    { label: "Success Rate",      value: `${stats.success_rate}%`,color: "#faf5ff", border: "#e9d5ff", text: "#7c3aed" },
  ] : [];

  if (loading) {
    return (
      <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading dashboard...</p>
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
          <span style={s.navLink} onClick={() => navigate("/educator")}>Educator View</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={s.avatar}>{initials}</div>
          <span
            style={{ color: "#8892b0", fontSize: "12px", cursor: "pointer" }}
            onClick={() => { localStorage.clear(); navigate("/"); }}
          >
            Logout
          </span>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.pageHeader}>
          <div>
            <div style={s.pageTitle}>Student Dashboard</div>
            <div style={s.pageSubtitle}>Welcome back, {userName}! Here's your learning progress.</div>
          </div>
          <button style={s.editorBtn} onClick={() => navigate("/editor")}>▶ Go to Editor</button>
        </div>

        {/* Stat Cards — real data */}
        <div style={s.statsGrid}>
          {statCards.map((stat, i) => (
            <div key={i} style={{ ...s.statCard, background: stat.color, border: `1px solid ${stat.border}` }}>
              <div style={{ ...s.statValue, color: stat.text }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ML Risk Score — calculated from real data */}
        <div style={{ ...s.riskRow, background: riskBg, border: `1px solid ${riskBorder}` }}>
          <div style={s.riskNumberBox}>
            <span style={{ ...s.riskNumber, color: riskColor }}>{riskScore}</span>
            <span style={s.riskSlash}>/ 100</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={s.riskTitle}>ML Risk Score</span>
              <span style={{ ...s.riskBadge, background: riskColor }}>{riskLevel}</span>
            </div>
            <div style={s.riskBarBg}>
              <div style={{ ...s.riskBarFill, width: `${riskScore}%`, background: riskColor }}></div>
            </div>
            <div style={s.riskNote}>Based on your error rate and attempt patterns.</div>
          </div>
        </div>

        {/* Submissions + Error Breakdown */}
        <div style={s.row}>
          <div style={s.card}>
            <div style={s.cardHeader}>Recent Submissions</div>
            {submissions.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No submissions yet.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>{["#", "Language", "Status", "Error Type", "Time"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {submissions.map((r, i) => {
                    const badge = getErrorTypeBadge(r.error_type);
                    return (
                      <tr key={i} style={s.tr}>
                        <td style={s.td}>{r.exec_id}</td>
                        <td style={s.td}><span style={s.langBadge}>{r.language}</span></td>
                        <td style={s.td}>
                          <span style={r.is_success ? s.successBadge : s.errorBadge}>
                            {r.is_success ? "Success" : "Error"}
                          </span>
                        </td>
                        <td style={s.td}>
                          {badge
                            ? <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{badge.label}</span>
                            : <span style={{ color: "#cbd5e1" }}>—</span>
                          }
                        </td>
                        <td style={{ ...s.td, color: "#94a3b8" }}>{timeAgo(r.executed_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ ...s.card, width: "280px", flexShrink: 0, marginBottom: 0 }}>
            <div style={s.cardHeader}>Error Breakdown</div>
            {errorData.length === 0
              ? <p style={{ color: "#94a3b8", fontSize: "13px" }}>No errors yet!</p>
              : errorData.map((e, i) => (
                <div key={i} style={{ marginBottom: "1.1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{e.error_type}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: errorColors[e.error_type] || "#64748b" }}>{e.count}</span>
                  </div>
                  <div style={s.barBg}>
                    <div style={{ ...s.barFill, width: `${(parseInt(e.count) / maxError) * 100}%`, background: errorColors[e.error_type] || "#64748b" }}></div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Language Usage */}
        <div style={s.card}>
          <div style={s.cardHeader}>Language Usage</div>
          {langData.length === 0
            ? <p style={{ color: "#94a3b8", fontSize: "13px" }}>No data yet.</p>
            : <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {langData.map((l, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", textTransform: "capitalize" }}>{l.language}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{l.count} runs</span>
                    </div>
                    <div style={s.barBg}>
                      <div style={{ ...s.barFill, width: `${(parseInt(l.count) / maxLang) * 100}%`, background: langColors[l.language] || "#64748b" }}></div>
                    </div>
                  </div>
                ))}
              </div>
          }
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
  editorBtn:    { background: "#2d3561", border: "none", color: "#fff", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  statsGrid:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "1.25rem" },
  statCard:     { borderRadius: "12px", padding: "1.25rem 1rem", textAlign: "center" },
  statValue:    { fontSize: "30px", fontWeight: "800", marginBottom: "6px" },
  statLabel:    { fontSize: "12px", color: "#64748b", fontWeight: "500" },
  riskRow:      { display: "flex", alignItems: "center", gap: "20px", borderRadius: "12px", padding: "16px 20px", marginBottom: "1.5rem" },
  riskNumberBox:{ display: "flex", alignItems: "baseline", gap: "4px" },
  riskNumber:   { fontSize: "40px", fontWeight: "800" },
  riskSlash:    { fontSize: "14px", color: "#a78bfa" },
  riskTitle:    { fontSize: "14px", fontWeight: "700", color: "#1a1f36" },
  riskBadge:    { color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
  riskBarBg:    { background: "#e9d5ff", borderRadius: "10px", height: "8px", overflow: "hidden", marginBottom: "8px" },
  riskBarFill:  { height: "8px", borderRadius: "10px" },
  riskNote:     { fontSize: "12px", color: "#6d28d9", lineHeight: "1.6" },
  row:          { display: "flex", gap: "16px", marginBottom: "1.5rem" },
  card:         { flex: 1, background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" },
  cardHeader:   { fontSize: "14px", fontWeight: "700", color: "#1a1f36", marginBottom: "1rem" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { fontSize: "11px", color: "#94a3b8", fontWeight: "600", textAlign: "left", padding: "8px", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" },
  tr:           { borderBottom: "1px solid #f8fafc" },
  td:           { fontSize: "13px", color: "#1a1f36", padding: "10px 8px" },
  langBadge:    { background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" },
  successBadge: { background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" },
  errorBadge:   { background: "#fef2f2", color: "#dc2626", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" },
  barBg:        { background: "#f1f5f9", borderRadius: "10px", height: "8px", overflow: "hidden" },
  barFill:      { height: "8px", borderRadius: "10px" },
};