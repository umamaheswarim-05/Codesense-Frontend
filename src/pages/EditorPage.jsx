import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EditorPage() {
  const navigate = useNavigate();
  const [code, setCode]            = useState("# Write your code here\nprint('Hello, CodeSense!')");
  const [language, setLanguage]    = useState("python");
  const [output, setOutput]        = useState("");
  const [error, setError]          = useState("");
  const [loading, setLoading]      = useState(false);
  const [aiExplanation, setAiExpl] = useState("");
  const [errorType, setErrorType]  = useState("");

  const sampleCodes = {
    python:     "# Write your code here\nprint('Hello, CodeSense!')",
    java:       `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, CodeSense!");\n  }\n}`,
    cpp:        `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, CodeSense!" << endl;\n  return 0;\n}`,
    javascript: "// Write your code here\nconsole.log('Hello, CodeSense!');",
  };

  const fileExt = { python: "py", java: "java", cpp: "cpp", javascript: "js" };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCode(sampleCodes[e.target.value]);
    setOutput(""); setError(""); setAiExpl(""); setErrorType("");
  };

  // ===== handleRun — connected to backend API =====
  const handleRun = async () => {
    setLoading(true);
    setOutput(""); setError(""); setAiExpl(""); setErrorType("");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("http://localhost:5000/api/execute/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          userId: user.id || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOutput(data.output || "Code executed successfully");
      } else {
        setError(data.error || "An error occurred");
        setErrorType(data.errorType || "");
        setAiExpl(data.aiExplanation || "");
      }

    } catch (err) {
      setError("Cannot connect to backend server. Make sure it is running on port 5000.");
      setErrorType("Runtime");
    } finally {
      setLoading(false);
    }
  };

  // Ctrl+Enter keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [code, language]);

  const errorTypeBadgeStyle = {
    Syntax:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    Runtime: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    Logic:   { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  };

  // Get user initials for avatar
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.firstName ? user.firstName[0] + (user.lastName ? user.lastName[0] : "") : "UM";

  return (
    <div style={s.root}>
      {/* Navbar */}
      <div style={s.navbar}>
        <div style={s.logo}>Code<span style={{ color: "#6ee7b7" }}>Sense</span></div>
        <div style={s.navLinks}>
          <span style={s.navActive}>Editor</span>
          <span style={s.navLink} onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span style={s.navLink} onClick={() => navigate("/educator")}>Educator</span>
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

      <div style={s.main}>
        {/* Left: Code Editor */}
        <div style={s.editorPanel}>
          <div style={s.toolbar}>
            <div style={s.toolbarLeft}>
              <select style={s.langSelect} value={language} onChange={handleLanguageChange}>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
              </select>
              <span style={s.fileName}>main.{fileExt[language]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={s.shortcutHint}>Ctrl+Enter to run</span>
              <button
                style={loading ? s.btnLoading : s.runBtn}
                onClick={handleRun}
                disabled={loading}
              >
                {loading ? "⏳ Running..." : "▶ Run Code"}
              </button>
            </div>
          </div>

          <div style={s.editorWrap}>
            <div style={s.lineNumbers}>
              {code.split("\n").map((_, i) => (
                <div key={i} style={s.lineNum}>{i + 1}</div>
              ))}
            </div>
            <textarea
              style={s.textarea}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Output Panel */}
        <div style={s.outputPanel}>
          <div style={s.outputHeader}>Output</div>

          {/* Loading */}
          {loading && (
            <div style={s.loadingBox}>
              <div style={s.spinner} />
              <span style={{ color: "#94a3b8", fontSize: "13px" }}>Executing code…</span>
            </div>
          )}

          {/* Success */}
          {!loading && output && (
            <div style={s.successBox}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }} />
                <span style={s.outputLabel}>Execution successful</span>
              </div>
              <pre style={s.outputText}>{output}</pre>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <>
              <div style={s.errorBox}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626" }} />
                    <span style={s.errorLabel}>Error detected</span>
                  </div>
                  {errorType && (() => {
                    const b = errorTypeBadgeStyle[errorType] || errorTypeBadgeStyle.Runtime;
                    return (
                      <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                        {errorType} Error
                      </span>
                    );
                  })()}
                </div>
                <pre style={s.errorText}>{error}</pre>
              </div>

              {/* AI Explanation */}
              {aiExplanation && (
                <div style={s.aiBox}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c3aed" }} />
                    <span style={s.aiLabel}>AI Explanation</span>
                    <span style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "auto" }}>Claude API</span>
                  </div>
                  <p style={s.aiText}>{aiExplanation}</p>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!loading && !output && !error && (
            <div style={s.emptyState}>
              <div style={{ fontSize: "32px", marginBottom: "12px", color: "#cbd5e1" }}>▶</div>
              <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Run your code to see output</div>
              <div style={{ color: "#cbd5e1", fontSize: "12px" }}>
                Press <kbd style={s.kbd}>Ctrl+Enter</kbd> or click Run Code
              </div>
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
  main:         { display: "flex", height: "calc(100vh - 56px)" },
  editorPanel:  { flex: 1.2, display: "flex", flexDirection: "column", background: "#1e2235" },
  toolbar:      { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#13151f", borderBottom: "1px solid #2d3561" },
  toolbarLeft:  { display: "flex", alignItems: "center", gap: "12px" },
  langSelect:   { background: "#2d3561", border: "none", color: "#e2e8f0", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", outline: "none" },
  fileName:     { color: "#8892b0", fontSize: "12px", fontFamily: "monospace" },
  shortcutHint: { color: "#4a5568", fontSize: "11px" },
  runBtn:       { background: "#16a34a", border: "none", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  btnLoading:   { background: "#374151", border: "none", color: "#9ca3af", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "not-allowed" },
  editorWrap:   { display: "flex", flex: 1, overflow: "auto" },
  lineNumbers:  { background: "#13151f", padding: "16px 12px", textAlign: "right", userSelect: "none", minWidth: "40px" },
  lineNum:      { color: "#4a5568", fontSize: "13px", lineHeight: "1.6", fontFamily: "monospace" },
  textarea:     { flex: 1, background: "#1e2235", border: "none", outline: "none", color: "#e2e8f0", fontFamily: "monospace", fontSize: "14px", lineHeight: "1.6", padding: "16px", resize: "none" },
  outputPanel:  { width: "380px", background: "#fff", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "auto" },
  outputHeader: { padding: "14px 20px", fontWeight: "600", fontSize: "14px", color: "#1a1f36", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
  loadingBox:   { padding: "20px", display: "flex", alignItems: "center", gap: "10px" },
  spinner:      { width: "16px", height: "16px", border: "2px solid #e2e8f0", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  successBox:   { margin: "16px", background: "#f0fdf4", borderRadius: "10px", padding: "16px", border: "1px solid #bbf7d0" },
  outputLabel:  { color: "#16a34a", fontSize: "12px", fontWeight: "600" },
  outputText:   { color: "#166534", fontSize: "13px", fontFamily: "monospace", margin: 0, whiteSpace: "pre-wrap" },
  errorBox:     { margin: "16px 16px 0", background: "#fef2f2", borderRadius: "10px", padding: "16px", border: "1px solid #fecaca" },
  errorLabel:   { color: "#dc2626", fontSize: "12px", fontWeight: "600" },
  errorText:    { color: "#991b1b", fontSize: "13px", fontFamily: "monospace", margin: 0, whiteSpace: "pre-wrap" },
  aiBox:        { margin: "10px 16px 16px", background: "#eff6ff", borderRadius: "10px", padding: "16px", border: "1px solid #bfdbfe" },
  aiLabel:      { color: "#1d4ed8", fontSize: "12px", fontWeight: "600" },
  aiText:       { color: "#1e40af", fontSize: "13px", margin: 0, lineHeight: "1.6" },
  emptyState:   { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#cbd5e1", textAlign: "center", padding: "2rem" },
  kbd:          { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "2px 6px", fontSize: "11px", color: "#475569", fontFamily: "monospace" },
};
