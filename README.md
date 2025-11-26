📘 Social Media Content Analyzer

A lightweight React + Vite application that extracts text from PDFs and images, applies OCR for scanned documents, and generates insights like top hashtags, keyword trends, and suggested hashtags.
Designed to be fast, minimal, and fully client-side — perfect for portfolio and job assignment submissions.

🚀 Features
🔍 Text Extraction

Upload PDF files (text or scanned)

Upload Images (JPG, PNG, etc.)

Automatic detection:

Text-based PDFs → direct extraction

Scanned PDFs → page-by-page OCR using Tesseract.js

Image files → OCR

📊 Trend & Hashtag Analysis

Detect all hashtags (#example)

Word frequency analysis (cleaned and stop-words removed)

Auto-generate trending hashtag suggestions

Extract top keywords from extracted text

💾 Output Tools

Editable extracted text box

Copy-to-clipboard

Download as .txt

🖥️ Fully Client-Side

Runs entirely in the browser

No backend, no API keys

Safe and portable

🧩 Tech Stack
Part	Tech
UI	React + Vite
PDF Parsing	pdfjs-dist
OCR	Tesseract.js
Text Analysis	Custom JS (frequency, hashtags, suggestions)
Styling	Inline CSS (minimal), easily replaceable
📂 Project Structure
src/
  App.jsx
  analyzeText.js
  components/
    FileUploader.jsx
public/
  pdf.worker.min.mjs (or .js depending on version)

📦 Installation & Setup
1️⃣ Install dependencies
npm install

2️⃣ Copy the PDF worker

Locate the worker inside node_modules:

node_modules/pdfjs-dist/build/pdf.worker.min.mjs


Then place it inside:

public/pdf.worker.min.mjs


⚠️ The filename in public/ must match the one set in your code:
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

3️⃣ Start the dev server
npm run dev

🧪 How to Use

Click Upload File

Select a PDF or Image

Wait for:

Direct text extraction (fast), or

OCR (slower, especially for scanned pages)

View extracted text

Scroll right panel for:

Top hashtags

Trending words

Suggested hashtags

Copy or download extracted text as .txt

📝 Example Output

Hashtags Found

#exam #studentlife #motivation


Top Keywords

education (12)
semester (9)
deadline (7)
exam (5)


Suggested Hashtags

#education #semester #deadline #exam #motivation

⚠️ Notes & Limitations

OCR for scanned PDFs may take 5–15 seconds per page depending on CPU.

Very large PDFs (20+ pages) may process slowly on low-end devices.

Hashtag suggestions are generated from top keywords, not from external trend data.

For production, OCR is ideally done on a backend/serverless worker.

🧠 200-Word Approach (Job Submission Ready)

This project implements a lightweight Social Media Content Analyzer completely in the browser using React and Vite. Users can upload PDFs or images, and the system extracts text using two strategies. For normal PDFs, it uses pdfjs-dist to parse text directly, which is fast and accurate. For scanned PDFs and images, the app falls back to OCR using Tesseract.js, where each page is rendered to a canvas and processed.

Once text is extracted, a custom analysis module performs simple NLP tasks: hashtag detection with regular expressions, word-frequency calculation after stop-word removal, and automatic hashtag suggestion based on the most frequent keywords. This provides users with immediate insights into common themes and trending topics within the uploaded content.

The entire application runs client-side, avoiding the need for backend servers or API keys, making it portable and easy to deploy. The UI focuses on clarity, offering extraction progress, editable text, copy/download options, and a clean summary of trends. Extraction accuracy depends on input quality—scanned documents take longer due to OCR. The modular structure makes it easy to extend, such as adding sentiment analysis or charts for keyword visualization.

🌐 Deployment

Deploy easily on Vercel, Netlify, or GitHub Pages.

Example build command:

npm run build

✔️ Future Enhancements

Sentiment analysis (positive/negative)

Bar charts for keyword frequency

Support for multiple files at once

Detect trending topics by time windows

Export analysis as CSV