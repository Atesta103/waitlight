#!/usr/bin/env node
/**
 * check-dead-exports.mjs
 *
 * Scans app/, components/, lib/, types/ for exported symbols that are never
 * imported elsewhere in the codebase.
 *
 * Mode: WARNING ONLY (exits 0 even on violations).
 */

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()
const SCAN_DIRS = ["app", "components", "lib", "types"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function walk(dir) {
    try {
        const entries = await readdir(dir, { withFileTypes: true, recursive: true })
        return entries
            .filter(
                (e) =>
                    e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx"))
            )
            .map((e) => path.join(e.parentPath ?? e.path, e.name))
    } catch {
        return []
    }
}

// ─── Collect all source files ─────────────────────────────────────────────────

const allFiles = []
for (const dir of SCAN_DIRS) {
    allFiles.push(...(await walk(path.join(ROOT, dir))))
}

// Exclude __tests__ and *.test.ts files
const sourceFiles = allFiles.filter(
    (f) => !f.includes("__tests__") && !f.endsWith(".test.ts") && !f.endsWith(".test.tsx")
)

// ─── Parse exports ────────────────────────────────────────────────────────────

/** @type {Map<string, { file: string, names: string[] }>} */
const exportMap = new Map()

// Matches: export function Foo, export const foo, export type Foo, export class Foo
const EXPORT_REGEX =
    /^export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|var|class|type|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm
// Matches: export { Foo, Bar } or export { Foo as Baz }
const NAMED_EXPORT_REGEX = /^export\s*\{([^}]+)\}/gm

for (const file of sourceFiles) {
    const content = await readFile(file, "utf8")
    const names = []

    for (const match of content.matchAll(EXPORT_REGEX)) {
        names.push(match[1])
    }
    for (const match of content.matchAll(NAMED_EXPORT_REGEX)) {
        const items = match[1].split(",").map((s) => {
            const parts = s.trim().split(/\s+as\s+/)
            return parts[parts.length - 1].trim()
        })
        names.push(...items.filter(Boolean))
    }

    if (names.length > 0) {
        exportMap.set(file, { file, names })
    }
}

// ─── Collect all import references ────────────────────────────────────────────

const allContent = (
    await Promise.all(allFiles.map((f) => readFile(f, "utf8").catch(() => "")))
).join("\n")

// ─── Detect dead exports ──────────────────────────────────────────────────────

/** @type {{ file: string, name: string }[]} */
const dead = []

for (const { file, names } of exportMap.values()) {
    const relPath = path.relative(ROOT, file)
    for (const name of names) {
        // Skip "default" exports — hard to track usage reliably
        if (name === "default") continue
        // Count occurrences of the name in the full codebase content
        // A simple heuristic: if found fewer than 2 times it's likely only the
        // definition site (the export itself)
        const regex = new RegExp(`\\b${name}\\b`, "g")
        const count = (allContent.match(regex) ?? []).length
        if (count < 2) {
            dead.push({ file: relPath, name })
        }
    }
}

// ─── Report ───────────────────────────────────────────────────────────────────

if (dead.length === 0) {
    console.log("✅ [dead-exports] No dead exports found")
} else {
    console.warn(`\n⚠️  [dead-exports] ${dead.length} potentially unused export(s):\n`)
    for (const { file, name } of dead) {
        console.warn(`  • ${name}  in  ${file}`)
    }
    console.warn(
        "\n  These exports may be safe to remove if they are truly unused.\n"
    )
}

// Warning-only: always exit 0
process.exit(0)
