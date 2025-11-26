// src/copy-pdf-worker.js
// Copies pdf.worker from node_modules into public/ for pdfjs to load in the browser.
// Tries common locations and filenames; writes pdf-worker-info.json into public/ to indicate which file was used.

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const targetDir = path.join(projectRoot, "public");
const candidates = [
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  "node_modules/pdfjs-dist/build/pdf.worker.min.js",
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js",
  "node_modules/pdfjs-dist/build/pdf.worker.js"
];

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
  return true;
}

(function main() {
  const destFilenameCandidates = [
    "pdf.worker.min.mjs",
    "pdf.worker.min.js",
    "pdf.worker.js"
  ];

  let copied = false;
  let used = null;

  for (const srcRel of candidates) {
    const src = path.join(projectRoot, srcRel);
    if (!fs.existsSync(src)) continue;

    const ext = path.extname(src);
    const destName = destFilenameCandidates.find((n) => path.extname(n) === ext) || `pdf.worker${ext}`;
    const dest = path.join(targetDir, destName);

    try {
      copied = copyIfExists(src, dest);
      if (copied) {
        used = { src: srcRel, dest: destName };
        const metaPath = path.join(targetDir, "pdf-worker-info.json");
        fs.writeFileSync(metaPath, JSON.stringify(used, null, 2));
        break;
      }
    } catch (err) {
      console.error("Error copying worker:", err);
      process.exit(1);
    }
  }

  if (!copied) {
    console.warn("\nWarning: Could not find pdf.worker in node_modules/pdfjs-dist.");
    console.warn("You can add a PDF worker manually to public/ (e.g. public/pdf.worker.min.mjs) or ensure pdfjs-dist is installed.");
  } else {
    console.log("pdf-worker-info.json written to public/");
    console.log("Used worker:", used);
  }
})();