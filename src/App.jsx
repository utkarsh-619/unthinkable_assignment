// src/App.jsx
import { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import { analyzeText } from "./analyzeText";

export default function App() {
  const [rawText, setRawText] = useState("");
  const [analysis, setAnalysis] = useState({
    hashtags: [],
    topWords: [],
    suggestions: [],
  });

  useEffect(() => {
    // When rawText updates, run analysis
    const a = analyzeText(rawText || "");
    setAnalysis(a);
  }, [rawText]);

  const copyExtracted = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      alert("Copied extracted text to clipboard");
    } catch {
      alert("Copy failed");
    }
  };

  const downloadExtracted = () => {
    const blob = new Blob([rawText || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted_text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 20, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Social Media Content Analyzer</h1>
        <p style={{ marginTop: 6, color: "#555" }}>
          Upload PDF / image → extract text → analyze hashtags & keywords.
        </p>
      </header>

      <section style={{ marginBottom: 18 }}>
        <FileUploader onExtract={(text) => setRawText(text)} />
      </section>

      <main style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Left: extracted text */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Extracted Text</h2>
            <div>
              <button onClick={copyExtracted} style={{ marginRight: 8 }}>Copy</button>
              <button onClick={downloadExtracted}>Download .txt</button>
            </div>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Extracted text will appear here..."
            rows={18}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #1b1818ff",
              fontFamily: "inherit",
              lineHeight: 1.4,
              resize: "vertical"
            }}
          />
        </div>

        {/* Right: analysis */}
        <aside style={{ border: "1px solid #342a2aff", padding: 12, borderRadius: 8, background: "#614646ff" }}>
          <h3 style={{ marginTop: 0 }}>Analysis Summary</h3>

          <div style={{ marginBottom: 12 }}>
            <strong>Top Hashtags</strong>
            {analysis.hashtags.length === 0 ? (
              <div style={{ color: "#dfdfdfff", marginTop: 6 }}>No hashtags found</div>
            ) : (
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                {analysis.hashtags.map(([tag, count]) => (
                  <li key={tag} style={{ marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{tag}</span> <span style={{ color: "#131212ff" }}>— {count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Top Words</strong>
            {analysis.topWords.length === 0 ? (
              <div style={{ color: "#777", marginTop: 6 }}>No keywords found</div>
            ) : (
              <ol style={{ marginTop: 8 }}>
                {analysis.topWords.map(([w, c]) => (
                  <li key={w} style={{ marginBottom: 6 }}>
                    {w} <span style={{ color: "#666", marginLeft: 8 }}>{c}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div>
            <strong>Suggested Hashtags</strong>
            {analysis.suggestions.length === 0 ? (
              <div style={{ color: "#777", marginTop: 6 }}>No suggestions</div>
            ) : (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {analysis.suggestions.slice(0, 12).map((s) => (
                  <div
                    key={s}
                    style={{
                      padding: "6px 8px",
                      background: "#100f0fff",
                      border: "1px solid #5a4848ff",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      <footer style={{ marginTop: 20, color: "#666", fontSize: 13 }}>
        Quick tips: edit the extracted text to improve suggestions. For large-scale or real-time tracking, integrate platform APIs and a backend for aggregating posts.
      </footer>
    </div>
  );
}
