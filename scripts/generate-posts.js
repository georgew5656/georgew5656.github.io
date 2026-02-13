#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const postsDir = path.join(repoRoot, "src", "posts");
const outFile = path.join(repoRoot, "src", "posts.json");

function safeSlug(name) {
  return encodeURIComponent(name);
}

function titleFromSlug(slug) {
  const words = slug
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function dateFromGit(filePath) {
  try {
    const cmd = `git log --diff-filter=A --follow --format=%ad --date=iso-strict -- "${filePath}"`;
    const out = execSync(cmd, { cwd: repoRoot, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    if (!out) return null;
    const lines = out.split(/\r?\n/).filter(Boolean);
    return lines[lines.length - 1];
  } catch {
    return null;
  }
}

function dateFromFs(filePath) {
  const stat = fs.statSync(filePath);
  const d = stat.birthtime && !isNaN(stat.birthtime) ? stat.birthtime : stat.ctime;
  return d.toISOString();
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith(".md"))
  .sort();

const posts = files.map(file => {
  const slug = path.basename(file, ".md");
  const fullPath = path.join(postsDir, file);
  const gitDate = dateFromGit(path.relative(repoRoot, fullPath));
  const dateIso = gitDate || dateFromFs(fullPath);
  return {
    date: formatDate(dateIso),
    dateIso,
    path: safeSlug(slug),
    title: titleFromSlug(slug),
  };
});

posts.sort((a, b) => new Date(b.dateIso) - new Date(a.dateIso));

fs.writeFileSync(outFile, JSON.stringify(posts, null, 2) + "\n");
console.log(`Wrote ${posts.length} posts to ${path.relative(repoRoot, outFile)}`);
