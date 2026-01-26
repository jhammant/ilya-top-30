#!/usr/bin/env node
/**
 * Bundle precomputed data for static PWA deployment.
 *
 * Copies precomputed JSON files from data/precomputed to web/public/data/precomputed
 * so they can be served as static files and cached by the service worker.
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.join(__dirname, "../../data/precomputed");
const TARGET_DIR = path.join(__dirname, "../public/data/precomputed");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    return 0;
  }

  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    let count = 0;
    for (const item of fs.readdirSync(src)) {
      count += copyRecursive(path.join(src, item), path.join(dest, item));
    }
    return count;
  } else if (stats.isFile() && src.endsWith(".json")) {
    fs.copyFileSync(src, dest);
    return 1;
  }

  return 0;
}

function main() {
  console.log("Bundling precomputed data for static deployment...");
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Target: ${TARGET_DIR}`);

  // Clean target directory
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true });
  }

  // Copy files
  const fileCount = copyRecursive(SOURCE_DIR, TARGET_DIR);

  console.log(`\nCopied ${fileCount} JSON files to ${TARGET_DIR}`);

  // Generate manifest of all papers with precomputed content
  const papersDir = path.join(TARGET_DIR, "papers");
  const paperIds = [];

  if (fs.existsSync(papersDir)) {
    for (const dir of fs.readdirSync(papersDir)) {
      const paperId = parseInt(dir);
      if (!isNaN(paperId)) {
        const summaryPath = path.join(papersDir, dir, "summary.json");
        if (fs.existsSync(summaryPath)) {
          paperIds.push(paperId);
        }
      }
    }
  }

  paperIds.sort((a, b) => a - b);

  const manifest = {
    generated_at: new Date().toISOString(),
    total_papers: paperIds.length,
    papers: paperIds,
    files_per_paper: ["summary.json", "concepts.json", "qa.json", "learning_steps.json", "faq.json"],
    cross_paper_files: ["knowledge_graph.json", "learning_paths.json"],
  };

  const manifestPath = path.join(TARGET_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated manifest with ${paperIds.length} papers: ${manifestPath}`);

  console.log("\nDone! Data is ready for static deployment.");
}

main();
