#!/usr/bin/env node
/**
 * check-schema-migration.mjs
 *
 * Guard: if any file in supabase/migrations/ is staged, ensure the staged
 * changes also include updated Supabase types (types/database.ts).
 *
 * If only migration files are staged but types are NOT, the commit is blocked.
 */

import { execSync } from "node:child_process"

// Staged files list
let staged
try {
    staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean)
} catch {
    // Not in a git repo or git not available — skip silently
    process.exit(0)
}

const migrationStaged = staged.some((f) => f.startsWith("supabase/migrations/"))
const typesStaged = staged.some((f) => f === "types/database.ts")

if (migrationStaged && !typesStaged) {
    console.error(`
❌ [schema-guard] You staged a Supabase migration but forgot to regenerate types.

  Run the following command and stage the result:

    npx supabase gen types typescript --local > types/database.ts

  Then add it to your commit:

    git add types/database.ts
`)
    process.exit(1)
}

if (migrationStaged) {
    console.log("✅ [schema-guard] Supabase migration staged with updated types")
} else {
    // Nothing to check
    process.exit(0)
}
