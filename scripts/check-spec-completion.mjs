#!/usr/bin/env node
/**
 * check-spec-completion.mjs
 *
 * Pre-commit hook: scans all doc/features/*.md spec files and auto-removes
 * any file whose "Definition of Done" section (§14) has ALL items checked [x].
 *
 * Conditions for deletion:
 *   1. Every line starting with "- [" in the DoD section is "- [x]" (no "- [ ]" remaining).
 *   2. The file's metadata contains `Status: \`implemented\`` (not proposed/in-progress).
 *
 * The deleted files are staged (`git add -A`) so they are included in the commit.
 */

import { readFileSync, readdirSync, unlinkSync } from "fs";
import { join, basename } from "path";
import { execSync } from "child_process";

const FEATURES_DIR = join(process.cwd(), "doc", "features");
const EXCLUDE = ["README.md"];

/**
 * Parse a spec file and return:
 *  - isImplemented: true if Status is `implemented`
 *  - dodComplete: true if all DoD checkboxes are [x]
 */
function analyzeSpec(content) {
  const lines = content.split("\n");

  // Check status
  const statusLine = lines.find((l) => l.startsWith("- Status:"));
  const isImplemented = statusLine?.includes("`implemented`") ?? false;

  // Locate the DoD section (## 14. Definition of Done)
  const dodStart = lines.findIndex((l) => /^##\s+14\./.test(l));
  if (dodStart === -1) return { isImplemented, dodComplete: false };

  // Collect lines until the next ##-level section or EOF
  const dodLines = [];
  for (let i = dodStart + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break;
    dodLines.push(lines[i]);
  }

  // Find all checkbox lines
  const checkboxLines = dodLines.filter((l) => /^\s*- \[/.test(l));
  if (checkboxLines.length === 0) return { isImplemented, dodComplete: false };

  // All must be [x]
  const dodComplete = checkboxLines.every((l) => /^\s*- \[x\]/i.test(l));

  return { isImplemented, dodComplete };
}

// ── Main ──────────────────────────────────────────────────────────────────────

let files;
try {
  files = readdirSync(FEATURES_DIR).filter(
    (f) => f.endsWith(".md") && !EXCLUDE.includes(f)
  );
} catch {
  // doc/features doesn't exist — nothing to do
  process.exit(0);
}

const deleted = [];

for (const file of files) {
  const filePath = join(FEATURES_DIR, file);
  const content = readFileSync(filePath, "utf-8");

  const { isImplemented, dodComplete } = analyzeSpec(content);

  if (isImplemented && dodComplete) {
    console.log(
      `🗑  Spec fully completed — removing: doc/features/${file}`
    );
    unlinkSync(filePath);
    deleted.push(filePath);
  }
}

if (deleted.length > 0) {
  // Stage the deletions so they're part of the commit
  execSync("git add " + deleted.map((p) => `"${p}"`).join(" "), {
    stdio: "inherit",
  });
  console.log(
    `✅ ${deleted.length} completed spec file(s) removed and staged.`
  );
} else {
  console.log("✔  Spec check: no fully-completed specs to remove.");
}
