#!/usr/bin/env node
/**
 * check-app-storybook-contract.mjs
 *
 * 1. Forbids native interactive HTML tags in app/ (input, select, textarea,
 *    button, label, datalist) — use design-system components instead.
 * 2. Warns when a @/components/ui/* import has no *.stories.* file.
 */

import { readdir, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, "app")
const COMPONENTS_UI_DIR = path.join(ROOT, "components", "ui")
const COMPONENTS_COMPOSED_DIR = path.join(ROOT, "components", "composed")

const FORBIDDEN_TAGS = ["input", "select", "textarea", "button", "label", "datalist"]
// Matches <button, <input, etc. — but NOT components like <Button
const TAG_REGEX = new RegExp(`<(${FORBIDDEN_TAGS.join("|")})[\\s>/]`, "g")

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function walk(dir, exts = [".ts", ".tsx"]) {
    const entries = await readdir(dir, { withFileTypes: true, recursive: true })
    return entries
        .filter((e) => e.isFile() && exts.some((ext) => e.name.endsWith(ext)))
        .map((e) => path.join(e.parentPath ?? e.path, e.name))
}

async function checkForbiddenTags() {
    let violations = []
    let files
    try {
        files = await walk(APP_DIR)
    } catch {
        // app/ doesn't exist — skip
        return violations
    }

    for (const file of files) {
        const content = await readFile(file, "utf8")
        const matches = [...content.matchAll(TAG_REGEX)]
        for (const match of matches) {
            violations.push({
                file: path.relative(ROOT, file),
                tag: match[1],
            })
        }
    }
    return violations
}

async function checkStorybook() {
    // Collect all TS/TSX files
    const dirs = ["app", "components", "lib"].map((d) => path.join(ROOT, d))
    let allFiles = []
    for (const dir of dirs) {
        try {
            allFiles.push(...(await walk(dir)))
        } catch {
            // dir may not exist
        }
    }

    const UI_IMPORT_REGEX = /@\/components\/ui\/([a-zA-Z0-9_-]+)/g
    const missingStories = new Set()

    for (const file of allFiles) {
        const content = await readFile(file, "utf8")
        const matches = [...content.matchAll(UI_IMPORT_REGEX)]
        for (const match of matches) {
            const componentName = match[1]
            const componentDir = path.join(COMPONENTS_UI_DIR, componentName)
            const componentFile = path.join(COMPONENTS_UI_DIR, componentName + ".tsx")

            // Check for a stories file — co-located OR in centralised stories/ directory
            const possibleStories = [
                // Co-located alongside the component
                path.join(COMPONENTS_UI_DIR, `${componentName}.stories.tsx`),
                path.join(COMPONENTS_UI_DIR, `${componentName}.stories.ts`),
                path.join(componentDir, `${componentName}.stories.tsx`),
                path.join(componentDir, `${componentName}.stories.ts`),
                // Centralised stories/ directory (atoms and molecules)
                path.join(ROOT, "stories", "ui", `${componentName}.stories.tsx`),
                path.join(ROOT, "stories", "ui", `${componentName}.stories.ts`),
                path.join(ROOT, "stories", "composed", `${componentName}.stories.tsx`),
                path.join(ROOT, "stories", "composed", `${componentName}.stories.ts`),
            ]
            const hasStory = possibleStories.some((p) => existsSync(p))
            const hasComponent = existsSync(componentFile) || existsSync(componentDir)

            if (hasComponent && !hasStory) {
                missingStories.add(componentName)
            }
        }
    }

    return [...missingStories]
}

async function checkComposedStorybook() {
    // All .tsx files in components/composed/ and components/sections/
    const composedComponents = []
    const sectionsDir = path.join(ROOT, "components", "sections")

    for (const [dir, label] of [[COMPONENTS_COMPOSED_DIR, "composed"], [sectionsDir, "sections"]]) {
        let files
        try {
            files = await walk(dir)
        } catch {
            continue
        }
        for (const file of files) {
            const name = path.basename(file, ".tsx")
            composedComponents.push({ name, dir: label })
        }
    }

    const missing = []
    for (const { name } of composedComponents) {
        const possibleStories = [
            path.join(ROOT, "stories", "composed", `${name}.stories.tsx`),
            path.join(ROOT, "stories", "composed", `${name}.stories.ts`),
            path.join(ROOT, "stories", "sections", `${name}.stories.tsx`),
            path.join(ROOT, "stories", "sections", `${name}.stories.ts`),
            // Also accept co-located
            path.join(COMPONENTS_COMPOSED_DIR, `${name}.stories.tsx`),
            path.join(path.join(ROOT, "components", "sections"), `${name}.stories.tsx`),
        ]
        if (!possibleStories.some((p) => existsSync(p))) {
            missing.push(name)
        }
    }
    return missing
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const tagViolations = await checkForbiddenTags()
const missingStories = await checkStorybook()
const missingComposedStories = await checkComposedStorybook()

let hasError = false

if (tagViolations.length > 0) {
    console.error("\n❌ [contract] Forbidden native HTML tags found in app/:\n")
    for (const v of tagViolations) {
        console.error(`  • <${v.tag}> in ${v.file}`)
    }
    console.error(
        "\n  Use design-system components from @/components/ui/ instead.\n"
    )
    hasError = true
}

if (missingStories.length > 0) {
    // Storybook is now configured — missing stories are a blocking error
    console.error("\n❌ [contract] UI components missing a Storybook story:\n")
    for (const name of missingStories) {
        console.error(`  • components/ui/${name}.tsx`)
    }
    console.error(
        "\n  Add a *.stories.tsx in stories/ui/ or co-locate alongside the component.\n"
    )
    hasError = true
}

if (missingComposedStories.length > 0) {
    console.error("\n⚠️  [contract] Composed/Section components missing a Storybook story:\n")
    for (const name of missingComposedStories) {
        console.error(`  • ${name}`)
    }
    console.error(
        "\n  Add a *.stories.tsx in stories/composed/ or stories/sections/.\n"
    )
    // warn only — not a blocking error
}

if (hasError) {
    process.exit(1)
}

console.log("✅ [contract] App ↔ design system contract OK")
