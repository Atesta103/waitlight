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
 * Fast-path: if no doc/features/*.md file is staged, the hook exits immediately
 * to avoid slowing down unrelated commits.
 *
 * The deleted files are staged (`git add`) so they are included in the commit.
 */

import { readFile, readdir, unlink } from "node:fs/promises"
import { join } from "node:path"
import { execSync } from "node:child_process"

const FEATURES_DIR = join(process.cwd(), "doc", "features")
const EXCLUDE = ["README.md", "spec-template.md"]

// ── Fast-path: skip if no doc/features file is staged ─────────────────────────

let staged = []
try {
  staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean)
} catch {
  // Not in a git repo — run the full check anyway
}

const featureStaged = staged.some((f) => f.startsWith("doc/features/") && f.endsWith(".md"))
if (staged.length > 0 && !featureStaged) {
  process.exit(0) // No spec files staged — skip silently
}

// ── Analyse a spec file ────────────────────────────────────────────────────────

/**
 * Parse a spec file and return:
 *  - isImplemented: true if Status is `implemented`
 *  - dodComplete: true if all DoD checkboxes are [x]
 */
function analyzeSpec(content) {
  const lines = content.split("\n")

  // Check status
  const statusLine = lines.find((l) => l.startsWith("- Status:"))
  const isImplemented = statusLine?.includes("`implemented`") ?? false

  // Locate the DoD section (matches "## 14. Definition of Done", "## Definition of Done", etc.)
  const dodStart = lines.findIndex((l) => /^##\s+(?:\d+\.\s+)?Definition of Done/i.test(l))
  if (dodStart === -1) return { isImplemented, dodComplete: false }

  // Collect lines until the next ##-level section or EOF
  const dodLines = []
  for (let i = dodStart + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break
    dodLines.push(lines[i])
  }

  // Find all checkbox lines
  const checkboxLines = dodLines.filter((l) => /^\s*- \[/.test(l))
  if (checkboxLines.length === 0) return { isImplemented, dodComplete: false }

  // All must be [x]
  const dodComplete = checkboxLines.every((l) => /^\s*- \[x\]/i.test(l))

  return { isImplemented, dodComplete }
}

// ── Main ───────────────────────────────────────────────────────────────────────

let files
try {
  const entries = await readdir(FEATURES_DIR)
  files = entries.filter((f) => f.endsWith(".md") && !EXCLUDE.includes(f))
} catch {
  // doc/features doesn't exist — nothing to do
  process.exit(0)
}

const deleted = []

for (const file of files) {
  const filePath = join(FEATURES_DIR, file)
  const content = await readFile(filePath, "utf-8")

  const { isImplemented, dodComplete } = analyzeSpec(content)

  if (isImplemented && dodComplete) {
    console.log(`🗑  Spec fully completed — removing: doc/features/${file}`)
    await unlink(filePath)
    deleted.push(filePath)
  }
}

if (deleted.length > 0) {
  // Stage the deletions so they're part of the commit
  // Use individual git add calls to avoid shell quoting issues on Windows
  for (const p of deleted) {
    execSync(`git add "${p}"`, { stdio: "inherit" })
  }
  console.log(`✅ [spec-check] ${deleted.length} completed spec file(s) removed and staged.`)
}
// Nothing deleted → silent exit 0
