/**
 * Seed script — generates realistic fake queue_items for the analytics page.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-analytics.mjs <email> <password>
 *
 * Example:
 *   node --env-file=.env scripts/seed-analytics.mjs marinclement98@gmail.com mypassword
 *
 * What it does:
 *  - Signs in as the merchant to get their real merchant_id
 *  - Inserts ~400 done queue_items spread over the past 90 days
 *  - Simulates realistic rush patterns (busy lunch 11h-13h, dinner 18h-20h,
 *    weekends slightly busier, quiet mornings/late nights)
 *  - Each ticket has a realistic wait time (2–20 min)
 */

import { createClient } from "@supabase/supabase-js"

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env")
    process.exit(1)
}

const [, , email, password] = process.argv
if (!email || !password) {
    console.error("Usage: node --env-file=.env scripts/seed-analytics.mjs <email> <password>")
    process.exit(1)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Weight for how likely a given hour is to have traffic (0–1). */
function hourWeight(hour) {
    // Lunch rush: 11–13
    if (hour >= 11 && hour <= 13) return 1.0
    // Dinner rush: 18–20
    if (hour >= 18 && hour <= 20) return 0.85
    // Mid-afternoon: 14–17
    if (hour >= 14 && hour <= 17) return 0.4
    // Morning: 8–10
    if (hour >= 8 && hour <= 10) return 0.25
    // Evening wind-down: 21–22
    if (hour >= 21 && hour <= 22) return 0.2
    // Night / very early: 0–7, 23
    return 0.02
}

/** Weight per day (0=Sun…6=Sat). Weekends are busier. */
function dayWeight(dow) {
    return [0.6, 0.7, 0.8, 0.85, 0.9, 1.0, 0.95][dow]
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min)
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60_000)
}

/** Generate a random past date within the last `days` days. */
function randomPastDate(days) {
    const now = Date.now()
    const past = now - days * 24 * 60 * 60 * 1000
    return new Date(past + Math.random() * (now - past))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log(`Signing in as ${email}…`)
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
if (authError || !authData.user) {
    console.error("Auth failed:", authError?.message)
    process.exit(1)
}

const merchantId = authData.user.id
console.log(`Authenticated — merchant_id: ${merchantId}`)

// Build fake tickets
const TOTAL_DAYS = 90
const TARGET_TICKETS = 500
const NAMES = [
    "Alice", "Bob", "Charlie", "Diana", "Émile", "Fatima", "Gabriel",
    "Hana", "Idriss", "Julia", "Karim", "Léa", "Marco", "Nina", "Omar",
    "Pauline", "Quentin", "Rania", "Sofiane", "Théo", "Uma", "Victor",
    "Wafa", "Xavier", "Yasmine", "Zahra",
]

const tickets = []

for (let i = 0; i < TARGET_TICKETS; i++) {
    // Pick a random base date in the last 90 days
    const joinedAt = randomPastDate(TOTAL_DAYS)
    const hour = joinedAt.getUTCHours()
    const dow = joinedAt.getUTCDay()

    // Reject this slot probabilistically based on rush pattern
    const weight = hourWeight(hour) * dayWeight(dow)
    if (Math.random() > weight) {
        // Re-roll into a busy slot instead of skipping entirely
        const busiestHours = [11, 12, 13, 18, 19, 20]
        const targetHour = busiestHours[Math.floor(Math.random() * busiestHours.length)]
        joinedAt.setUTCHours(targetHour, Math.floor(Math.random() * 60), 0, 0)
    }

    // Simulate realistic prep+wait time (2–20 min, longer during rush)
    const isRush = hourWeight(joinedAt.getUTCHours()) > 0.7
    const waitMin = isRush
        ? randomBetween(8, 20)
        : randomBetween(2, 10)

    const calledAt = addMinutes(joinedAt, randomBetween(0.5, 2))
    const doneAt = addMinutes(joinedAt, waitMin)

    tickets.push({
        merchant_id: merchantId,
        customer_name: NAMES[Math.floor(Math.random() * NAMES.length)],
        status: "done",
        joined_at: joinedAt.toISOString(),
        called_at: calledAt.toISOString(),
        done_at: doneAt.toISOString(),
    })
}

// Insert in batches of 100
const BATCH = 100
let inserted = 0

console.log(`Inserting ${tickets.length} tickets in batches of ${BATCH}…`)

for (let i = 0; i < tickets.length; i += BATCH) {
    const batch = tickets.slice(i, i + BATCH)
    const { error } = await supabase.from("queue_items").insert(batch)
    if (error) {
        console.error(`Batch ${i / BATCH + 1} failed:`, error.message)
        process.exit(1)
    }
    inserted += batch.length
    process.stdout.write(`  ${inserted}/${tickets.length}\r`)
}

console.log(`\nDone! ${inserted} tickets inserted for merchant ${merchantId}.`)
console.log("Reload the /analytics page — the charts should now show data.")
console.log("(The \"Tout l'historique\" preset queries live; no view refresh needed.)")
