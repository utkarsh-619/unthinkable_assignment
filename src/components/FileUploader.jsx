// src/components/FileUploader.jsx
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf"; // stable import for Vite
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"; // adjust if yours is .js

export default function FileUploader({ onExtract }) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState({ page: 0, total: 0, percent: 0 });
  const [filename, setFilename] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const renderPageToCanvas = async (page, scale = 2) => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  };

  // SAFER OCR: use high-level Tesseract.recognize(...) call (no createWorker/load)
  // This avoids bundler compatibility issues with createWorker() in some environments.
  const ocrCanvasRecognize = async (canvas) => {
    // Tesseract.recognize accepts canvas (or image/blob) and returns a promise
    // Do NOT pass a logger function here (it can cause DataCloneError in some setups).
    const result = await Tesseract.recognize(canvas, "eng");
    return result?.data?.text ?? "";
  };

  const extractPDFWithOCRFallback = async (file) => {
    setStatusText("Loading PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const total = pdf.numPages || 1;
    setProgress({ page: 0, total, percent: 0 });
    let allText = "";

    for (let i = 1; i <= total; i++) {
      setStatusText(`Processing page ${i} / ${total}...`);
      setProgress({ page: i, total, percent: Math.round(((i - 1) / total) * 100) });
      const page = await pdf.getPage(i);

      // try to get text content
      const content = await page.getTextContent();
      const pageText = content.items.map((it) => it.str).join(" ").trim();

      if (pageText && pageText.length > 30) {
        console.log(`Page ${i}: extracted text (len=${pageText.length})`);
        allText += pageText + "\n\n";
      } else {
        console.log(`Page ${i}: no text found, rendering canvas and running OCR (recognize)...`);
        setStatusText(`Page ${i}: running OCR (this can take some seconds)...`);
        const canvas = await renderPageToCanvas(page, 2); // 2x scale improves OCR accuracy

        // Use the simpler recognize API which is more robust across bundlers
        const ocrText = await ocrCanvasRecognize(canvas);
        console.log(`Page ${i}: OCR result length=${(ocrText || "").length}`);
        allText += (ocrText || "") + "\n\n";
      }
    }

    setProgress({ page: total, total, percent: 100 });
    setStatusText("Extraction finished");
    return allText.trim();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setExtractedText("");
    onExtract("");
    setLoading(true);
    setStatusText("Starting extraction...");
    setProgress({ page: 0, total: 0, percent: 0 });

    try {
      let text = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractPDFWithOCRFallback(file);
      } else if (file.type.startsWith("image/")) {
        setStatusText("Image uploaded — running OCR...");
        // convert image to canvas
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        await new Promise((res) => (img.onload = res));
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        text = await ocrCanvasRecognize(canvas);
      } else {
        alert("Only PDF or image files are supported.");
      }

      if (!text) console.warn("Extraction produced empty text - file may be encrypted or OCR failed.");
      setExtractedText(text);
      onExtract(text);
    } catch (err) {
      console.error("Extraction error:", err);
      alert("Error extracting text. See console for details.");
      setStatusText("Error during extraction");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      alert("Copied to clipboard");
    } catch {
      alert("Copy failed");
    }
  };

  const downloadText = () => {
    const blob = new Blob([extractedText || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (filename ? filename.replace(/\.[^/.]+$/, "") : "extracted") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <input type="file" accept=".pdf,image/*" onChange={handleFile} style={{ marginBottom: 8 }} />
      {filename && <div style={{ marginBottom: 6 }}>File: <strong>{filename}</strong></div>}

      {loading ? (
        <div style={{ marginBottom: 8 }}>
          <div>{statusText}</div>
          <div style={{ marginTop: 6 }}>
            {progress.total > 0 ? (
              <div>Page {progress.page} / {progress.total} — {progress.percent}%</div>
            ) : (
              <div>{progress.percent}%</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 8, color: "#888" }}>{statusText}</div>
      )}

      {extractedText ? (
        <div style={{ marginTop: 10 }}>
          <button onClick={copyToClipboard} style={{ marginRight: 8 }}>Copy</button>
          <button onClick={downloadText}>Download .txt</button>
        </div>
      ) : null}

      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        Tip: scanned PDFs take longer (Tesseract runs in your browser). Open DevTools Console to follow progress.
      </div>
    </div>
  );
}
