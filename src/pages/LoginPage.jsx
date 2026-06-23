import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "", role: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  // ===== LOGIN — connected to backend =====
  const doLogin = async (e) => {
    e.preventDefault();
    if (!form.email) return setError("Email is required.");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    if (!form.password) return setError("Password is required.");
    if (form.password.length < 6) return setError("Minimum 6 characters required.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Save token + user info for use across the app
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful! Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "educator") {
          navigate("/educator");
        } else {
          navigate("/editor");
        }
      }, 1000);

    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER — connected to backend =====
  const doRegister = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return setError("Full name is required.");
    if (!form.email || !form.email.includes("@")) return setError("Enter a valid email address.");
    if (!form.role) return setError("Please select your role.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Account created! Please login now.");

      // Switch to login tab after short delay, pre-fill email
      setTimeout(() => {
        setTab("login");
        setForm({ ...form, password: "", confirmPassword: "" });
        setSuccess("");
      }, 1500);

    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.wrap}>
        <div style={s.left}>
          <div>
            <div style={s.logo}>Code<span style={{ color: "#6ee7b7" }}>Sense</span></div>
            <div style={s.sub}>AI-Driven Code Execution Platform</div>
            {[
              { icon: "⚡", title: "Instant Code Execution", desc: "Run Python, Java, C++ & JS securely in browser" },
              { icon: "🤖", title: "AI Error Explanation", desc: "Claude AI explains every error in plain language" },
              { icon: "📊", title: "Smart Analytics", desc: "ML-powered insights for students and educators" },
            ].map((f, i) => (
              <div key={i} style={s.feature}>
                <div style={s.icon}>{f.icon}</div>
                <div>
                  <div style={s.featTitle}>{f.title}</div>
                  <div style={s.featDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ color: "#4a5568", fontSize: "11px" }}>© 2026 CodeSense. MSc Project.</div>
        </div>

        <div style={s.right}>
          <div style={s.tabs}>
            <button style={tab === "login" ? s.tabActive : s.tabInactive}
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Login</button>
            <button style={tab === "register" ? s.tabActive : s.tabInactive}
              onClick={() => { setTab("register"); setError(""); setSuccess(""); }}>Register</button>
          </div>

          {error && <div style={s.err}>⚠ {error}</div>}
          {success && <div style={s.suc}>✓ {success}</div>}

          {tab === "login" && (
            <form onSubmit={doLogin}>
              <div style={s.title}>Welcome back</div>
              <div style={s.desc}>Sign in to your CodeSense account</div>
              <label style={s.label}>Email Address</label>
              <input style={s.input} type="email" name="email"
                placeholder="you@college.edu" value={form.email} onChange={handleChange} />
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" name="password"
                placeholder="Enter your password" value={form.password} onChange={handleChange} />
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={doRegister}>
              <div style={s.title}>Create account</div>
              <div style={s.desc}>Join CodeSense to start learning</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>First Name</label>
                  <input style={s.input} type="text" name="firstName"
                    placeholder="Uma" value={form.firstName} onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Last Name</label>
                  <input style={s.input} type="text" name="lastName"
                    placeholder="Maheswari" value={form.lastName} onChange={handleChange} />
                </div>
              </div>
              <label style={s.label}>Email Address</label>
              <input style={s.input} type="email" name="email"
                placeholder="you@college.edu" value={form.email} onChange={handleChange} />
              <label style={s.label}>Role</label>
              <select style={s.input} name="role" value={form.role} onChange={handleChange}>
                <option value="">Select role...</option>
                <option value="student">Student</option>
                <option value="educator">Educator</option>
              </select>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" name="password"
                placeholder="Minimum 8 characters" value={form.password} onChange={handleChange} />
              <label style={s.label}>Confirm Password</label>
              <input style={s.input} type="password" name="confirmPassword"
                placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} />
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" },
  wrap: { display: "flex", width: "100%", maxWidth: "900px", background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.10)" },
  left: { flex: 1, background: "linear-gradient(135deg,#1a1f36 0%,#2d3561 100%)", padding: "3rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  logo: { fontFamily: "monospace", fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "0.5rem" },
  sub: { color: "#8892b0", fontSize: "13px", marginBottom: "2.5rem" },
  feature: { display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "1.25rem" },
  icon: { width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 },
  featTitle: { color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "2px" },
  featDesc: { color: "#8892b0", fontSize: "12px", lineHeight: "1.5" },
  right: { flex: 1, padding: "3rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" },
  tabs: { display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: "2rem" },
  tabActive: { flex: 1, padding: "10px", textAlign: "center", fontSize: "14px", fontWeight: "600", cursor: "pointer", border: "none", background: "transparent", borderBottom: "2px solid #2d3561", marginBottom: "-2px", color: "#2d3561" },
  tabInactive: { flex: 1, padding: "10px", textAlign: "center", fontSize: "14px", fontWeight: "500", cursor: "pointer", border: "none", background: "transparent", borderBottom: "2px solid transparent", marginBottom: "-2px", color: "#94a3b8" },
  title: { fontSize: "22px", fontWeight: "700", color: "#1a1f36", marginBottom: "0.25rem" },
  desc: { color: "#94a3b8", fontSize: "13px", marginBottom: "1.75rem" },
  label: { display: "block", fontSize: "11px", fontWeight: "600", color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "11px 14px", color: "#1a1f36", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "14px", outline: "none" },
  btn: { width: "100%", background: "#2d3561", border: "none", borderRadius: "10px", padding: "12px", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "4px", fontFamily: "inherit" },
  err: { background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", marginBottom: "12px" },
  suc: { background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#16a34a", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", marginBottom: "12px" },
};
