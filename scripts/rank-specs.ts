#!/usr/bin/env tsx
/**
 * rank-specs.ts
 *
 * Parses doc/features/*.md spec files written in the DevLens template format,
 * computes readiness & interest scores, and generates doc/features/README.md.
 *
 * Scoring uses the template metadata fields:
 *   - Readiness score: parsed from "- Readiness score: N/100" metadata line
 *     → fallback: computed from FR checklist + Definition of Done checklist
 *   - Interest score: computed from template metadata fields:
 *       (Value to user × 2 + Strategic priority × 2) / Time to code  [1–5 scale]
 *       normalized to 0–100
 *   - Status: parsed from "- Status: `...`" metadata line
 *
 * Gate: blocks with exit(1) if a spec with status `in-progress` has
 * readiness < 80/100.
 */

import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FEATURES_DIR = path.resolve(__dirname, "../doc/features")
const README_PATH = path.join(FEATURES_DIR, "README.md")

// ─── Types ────────────────────────────────────────────────────────────────────

type SpecStatus = "proposed" | "in-progress" | "implemented" | "unknown"

type Spec = {
    filename: string
    title: string
    status: SpecStatus
    readiness: number       // 0–100 (from metadata or computed from checklists)
    interestScore: number   // 0–100
    valueToUser: number     // 1–5
    strategicPriority: number // 1–5
    timeToCode: number      // 1–5
    frChecked: number
    frTotal: number
    dodChecked: number
    dodTotal: number
}

// ─── Metadata parsers ─────────────────────────────────────────────────────────

function parseMetaInt(content: string, key: string): number | null {
    const re = new RegExp(`-\\s*${key}:\\s*(\\d+)`, "i")
    const m = content.match(re)
    return m ? parseInt(m[1], 10) : null
}

function parseMetaScore(content: string, key: string): number | null {
    // Matches "- Readiness score: 85/100" or "- Interest score: 70/100"
    const re = new RegExp(`-\\s*${key}:\\s*(\\d+)\\s*/\\s*100`, "i")
    const m = content.match(re)
    return m ? parseInt(m[1], 10) : null
}

function parseStatus(content: string): SpecStatus {
    const m = content.match(/-\s*Status:\s*`([^`]+)`/i)
    if (!m) return "unknown"
    const raw = m[1].toLowerCase().trim()
    if (raw === "implemented") return "implemented"
    if (raw === "in-progress" || raw === "in progress") return "in-progress"
    if (raw === "proposed") return "proposed"
    return "unknown"
}

// ─── Checklist counters ───────────────────────────────────────────────────────

/**
 * Count checklist items within a specific section heading.
 * Returns { checked, total }.
 */
function countChecklistInSection(content: string, sectionHeading: string): { checked: number; total: number } {
    // Find the section and extract until the next ## heading
    const escapedHeading = sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const re = new RegExp(`##\\s+${escapedHeading}[^]*?(?=\\n##\\s|$)`, "i")
    const sectionMatch = content.match(re)
    if (!sectionMatch) return { checked: 0, total: 0 }
    const section = sectionMatch[0]
    const checked = (section.match(/- \[x\]/gi) ?? []).length
    const unchecked = (section.match(/- \[ \]/gi) ?? []).length
    return { checked, total: checked + unchecked }
}

// ─── Parse a spec file ────────────────────────────────────────────────────────

function parseSpec(filename: string, content: string): Spec {
    // Title: first H1
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : filename

    // Status from metadata
    const status = parseStatus(content)

    // Metadata numeric fields
    const valueToUser = parseMetaInt(content, "Value to user") ?? 3
    const strategicPriority = parseMetaInt(content, "Strategic priority") ?? 3
    const timeToCode = Math.max(1, parseMetaInt(content, "Time to code") ?? 3)

    // Readiness: prefer explicit metadata field, fallback to computed
    const metaReadiness = parseMetaScore(content, "Readiness score")

    // FR checklist (section 5)
    const frSection = countChecklistInSection(content, "5. Functional Requirements")
    // DoD checklist (section 14)
    const dodSection = countChecklistInSection(content, "14. Definition of Done")

    let readiness: number
    if (metaReadiness !== null) {
        readiness = metaReadiness
    } else {
        // Fallback: combine FR + DoD checklists
        const totalChecked = frSection.checked + dodSection.checked
        const total = frSection.total + dodSection.total
        readiness = total === 0 ? 0 : Math.round((totalChecked / total) * 100)
    }

    // Interest score: computed from metadata
    // Formula: (valueToUser * 2 + strategicPriority * 2 - timeToCode + 5) / 20 * 100
    // Max raw = 5*2 + 5*2 - 1 + 5 = 24 → normalized to 0–100
    const interestRaw = valueToUser * 2 + strategicPriority * 2 - timeToCode + 5
    const interestScore = Math.min(100, Math.max(0, Math.round((interestRaw / 24) * 100)))

    return {
        filename,
        title,
        status,
        readiness,
        interestScore,
        valueToUser,
        strategicPriority,
        timeToCode,
        frChecked: frSection.checked,
        frTotal: frSection.total,
        dodChecked: dodSection.checked,
        dodTotal: dodSection.total,
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

;(async () => {
const entries = await readdir(FEATURES_DIR)
const specFiles = entries
    .filter((f) => f.endsWith(".md") && f !== "README.md" && f !== "spec-template.md")
    .sort()

const specs: Spec[] = []

for (const filename of specFiles) {
    const content = await readFile(path.join(FEATURES_DIR, filename), "utf8")
    specs.push(parseSpec(filename, content))
}

// ─── Readiness gate ───────────────────────────────────────────────────────────

const READINESS_THRESHOLD = 80
let blocked = false

for (const spec of specs) {
    if (spec.status === "in-progress" && spec.readiness < READINESS_THRESHOLD) {
        console.error(
            `\n❌ [rank-specs] "${spec.title}" is in-progress but only ${spec.readiness}% ready (min: ${READINESS_THRESHOLD}%).\n` +
            `   Complete at least ${READINESS_THRESHOLD}% of tasks (FR + DoD) or update the metadata readiness score before continuing.\n`
        )
        blocked = true
    }
}

if (blocked) {
    process.exit(1)
}

// ─── Sort by interest score desc, readiness as tiebreak ───────────────────────

const ranked = [...specs].sort((a, b) => {
    if (b.interestScore !== a.interestScore) return b.interestScore - a.interestScore
    return b.readiness - a.readiness
})

// ─── Generate README.md ───────────────────────────────────────────────────────

const statusEmoji: Record<SpecStatus, string> = {
    "proposed": "⬜",
    "in-progress": "🔶",
    "implemented": "✅",
    "unknown": "❓",
}

const tableRows = ranked
    .map(
        (s) =>
            `| ${statusEmoji[s.status]} | [${s.title}](./${s.filename}) | ${s.valueToUser}/5 | ${s.strategicPriority}/5 | ${s.timeToCode}/5 | ${s.readiness}% | ${s.interestScore} |`
    )
    .join("\n")

const now = new Date().toISOString().slice(0, 10)
const readme = `# Feature Specs — Ranked Overview

> Auto-generated by \`npm run docs:rank\`. Do not edit this file manually.  
> Last updated: ${now}

| Status | Feature | Value | Priority | Effort | Readiness | Interest Score |
|--------|---------|-------|----------|--------|-----------|----------------|
${tableRows}

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented |
| 🔶 | In progress |
| ⬜ | Proposed (not started) |
| ❓ | Unknown status |

### Score Fields

| Field | Source |
|-------|--------|
| **Value** | \`Value to user\` 1–5 in spec metadata |
| **Priority** | \`Strategic priority\` 1–5 in spec metadata |
| **Effort** | \`Time to code\` 1–5 in spec metadata |
| **Readiness** | \`Readiness score: N/100\` in spec metadata (or computed from FR + DoD checklists) |
| **Interest Score** | \`(Value×2 + Priority×2 − Effort + 5) / 24 × 100\` — 0 to 100 |
`

await writeFile(README_PATH, readme, "utf8")

console.log(`✅ [rank-specs] Ranked ${ranked.length} specs → doc/features/README.md`)
})()
