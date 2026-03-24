#!/usr/bin/env tsx
/**
 * link-specs.ts
 *
 * Reads doc/features/*.md spec files and links each one to a GitHub issue.
 * - If no issue link is found in the file, creates a new issue via the
 *   GitHub API and appends the link at the top of the file.
 * - Requires environment variables:
 *     GITHUB_TOKEN  — personal access token or Actions token
 *     GITHUB_REPO   — e.g. "owner/repo"
 */

import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FEATURES_DIR = path.resolve(__dirname, "../doc/features")

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO

if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.error(
        "❌ [link-specs] Missing env vars: GITHUB_TOKEN and GITHUB_REPO are required."
    )
    process.exit(1)
}

const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`
const HEADERS = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getExistingIssues(): Promise<
    Array<{ number: number; title: string; html_url: string }>
> {
    const res = await fetch(`${API_BASE}/issues?state=all&per_page=100&labels=spec`, {
        headers: HEADERS,
    })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Failed to list issues: ${res.status} ${body}`)
    }
    return res.json() as Promise<Array<{ number: number; title: string; html_url: string }>>
}

async function createIssue(title: string, body: string): Promise<{ number: number; html_url: string }> {
    const res = await fetch(`${API_BASE}/issues`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ title, body, labels: ["spec"] }),
    })
    if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Failed to create issue "${title}": ${res.status} ${errBody}`)
    }
    return res.json() as Promise<{ number: number; html_url: string }>
}

// ─── Main ─────────────────────────────────────────────────────────────────────

;(async () => {
const existingIssues = await getExistingIssues()
console.log(`  Found ${existingIssues.length} existing spec issues on GitHub.`)

const entries = await readdir(FEATURES_DIR)
const specFiles = entries
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort()

let linked = 0
let created = 0
let skipped = 0

for (const filename of specFiles) {
    const filePath = path.join(FEATURES_DIR, filename)
    const content = await readFile(filePath, "utf8")

    // Check if already linked
    const alreadyLinked = /<!-- github-issue: #\d+ -->/.test(content)
    if (alreadyLinked) {
        console.log(`  ⏩ ${filename} — already linked`)
        skipped++
        continue
    }

    // Extract title from first H1
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/, "")

    // Check if an issue with this title already exists
    const existing = existingIssues.find(
        (i) => i.title.toLowerCase() === title.toLowerCase()
    )

    let issueNumber: number
    let issueUrl: string

    if (existing) {
        issueNumber = existing.number
        issueUrl = existing.html_url
        console.log(`  🔗 ${filename} → #${issueNumber} (existing)`)
        linked++
    } else {
        // Create a new issue
        const body = `**Spec file**: [\`doc/features/${filename}\`](../../blob/main/doc/features/${filename})\n\nAuto-linked by the \`docs:link\` script.`
        const issue = await createIssue(`[spec] ${title}`, body)
        issueNumber = issue.number
        issueUrl = issue.html_url
        console.log(`  🆕 ${filename} → #${issueNumber} (created)`)
        created++
    }

    // Prepend a link comment to the file
    const badge = `<!-- github-issue: #${issueNumber} -->\n<!-- Issue: ${issueUrl} -->\n\n`
    await writeFile(filePath, badge + content, "utf8")
}

console.log(
    `\n✅ [link-specs] Done — ${linked} linked, ${created} created, ${skipped} skipped.`
)
})()
