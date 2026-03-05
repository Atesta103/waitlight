"use client"

import { cn } from "@/lib/utils/cn"
import { Check, X, Info } from "lucide-react"

// ─── Password rules ──────────────────────────────────────────────────────────

type Rule = {
    id: string
    label: string
    test: (pw: string) => boolean
}

const PASSWORD_RULES: Rule[] = [
    {
        id: "length",
        label: "8 caractères minimum",
        test: (pw) => pw.length >= 8,
    },
    {
        id: "uppercase",
        label: "1 lettre majuscule",
        test: (pw) => /[A-Z]/.test(pw),
    },
    {
        id: "lowercase",
        label: "1 lettre minuscule",
        test: (pw) => /[a-z]/.test(pw),
    },
    { id: "digit", label: "1 chiffre", test: (pw) => /\d/.test(pw) },
    {
        id: "special",
        label: "1 caractère spécial (!@#$…)",
        test: (pw) => /[^A-Za-z0-9]/.test(pw),
    },
]

// ─── Strength calculation ────────────────────────────────────────────────────

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong"

function getStrength(password: string): {
    level: StrengthLevel
    score: number
} {
    if (!password) return { level: "empty", score: 0 }

    const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
    const total = PASSWORD_RULES.length

    // Bonus for longer passwords
    const lengthBonus = password.length >= 12 ? 1 : 0
    const raw = passed + lengthBonus

    if (raw <= 2)
        return { level: "weak", score: Math.round((passed / total) * 100) }
    if (raw <= 3)
        return { level: "fair", score: Math.round((passed / total) * 100) }
    if (raw <= 4)
        return { level: "good", score: Math.round((passed / total) * 100) }
    return { level: "strong", score: 100 }
}

const STRENGTH_CONFIG: Record<
    StrengthLevel,
    { label: string; color: string; barColor: string }
> = {
    empty: {
        label: "",
        color: "text-text-disabled",
        barColor: "bg-border-default",
    },
    weak: {
        label: "Faible",
        color: "text-feedback-error",
        barColor: "bg-feedback-error",
    },
    fair: { label: "Moyen", color: "text-amber-500", barColor: "bg-amber-500" },
    good: {
        label: "Bon",
        color: "text-brand-primary",
        barColor: "bg-brand-primary",
    },
    strong: {
        label: "Excellent",
        color: "text-feedback-success",
        barColor: "bg-feedback-success",
    },
}

// ─── Password generator ──────────────────────────────────────────────────────

const CHARSET_LOWER = "abcdefghijklmnopqrstuvwxyz"
const CHARSET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const CHARSET_DIGITS = "0123456789"
const CHARSET_SPECIAL = "!@#$%&*-_=+?"
const ALL_CHARS =
    CHARSET_LOWER + CHARSET_UPPER + CHARSET_DIGITS + CHARSET_SPECIAL

function generateSecurePassword(length = 16): string {
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)

    // Guarantee at least one char from each set
    const guaranteed = [
        CHARSET_LOWER[array[0]! % CHARSET_LOWER.length]!,
        CHARSET_UPPER[array[1]! % CHARSET_UPPER.length]!,
        CHARSET_DIGITS[array[2]! % CHARSET_DIGITS.length]!,
        CHARSET_SPECIAL[array[3]! % CHARSET_SPECIAL.length]!,
    ]

    const remaining = Array.from(
        { length: length - guaranteed.length },
        (_, i) => {
            const idx = array[i + guaranteed.length]! % ALL_CHARS.length
            return ALL_CHARS[idx]!
        },
    )

    // Shuffle using Fisher-Yates
    const chars = [...guaranteed, ...remaining]
    for (let i = chars.length - 1; i > 0; i--) {
        const shuffleArray = new Uint32Array(1)
        crypto.getRandomValues(shuffleArray)
        const j = shuffleArray[0]! % (i + 1)
        ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
    }

    return chars.join("")
}

// ─── Component ───────────────────────────────────────────────────────────────

type PasswordStrengthMeterProps = {
    password: string
    className?: string
}

/**
 * Molecule — Real-time password strength indicator.
 * Shows a segmented bar, per-rule checklist, and an optional generate button.
 */
function PasswordStrengthMeter({
    password,
    className,
}: PasswordStrengthMeterProps) {
    const { level, score } = getStrength(password)
    const config = STRENGTH_CONFIG[level]

    if (!password) return null

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {/* Segmented strength bar + label + tooltip trigger (desktop) */}
            <div className="flex items-center gap-2">
                <div className="flex w-24 shrink-0 gap-1">
                    {[1, 2, 3, 4].map((segment) => {
                        const segmentThreshold = segment * 25
                        const filled = score >= segmentThreshold
                        return (
                            <div
                                key={segment}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                                    filled
                                        ? config.barColor
                                        : "bg-border-default",
                                )}
                            />
                        )
                    })}
                </div>
                {level !== "empty" ? (
                    <div className="flex items-center gap-1">
                        <span
                            className={cn("text-xs font-medium", config.color)}
                        >
                            {config.label}
                        </span>

                        {/* Info tooltip — desktop only */}
                        <div className="group/info relative hidden sm:block">
                            <button
                                type="button"
                                aria-label="Voir les exigences du mot de passe"
                                className="flex cursor-pointer items-center rounded-full text-text-secondary transition-colors hover:text-text-primary"
                            >
                                <Info size={13} aria-hidden="true" />
                            </button>
                            {/* Tooltip panel */}
                            <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-56 rounded-md border border-border-default bg-surface-card p-3 shadow-md group-hover/info:block">
                                <ul
                                    className="grid grid-cols-1 gap-1"
                                    aria-label="Exigences du mot de passe"
                                >
                                    {PASSWORD_RULES.map((rule) => {
                                        const passed = rule.test(password)
                                        return (
                                            <li
                                                key={rule.id}
                                                className={cn(
                                                    "flex items-center gap-2 text-xs transition-colors",
                                                    passed
                                                        ? "text-feedback-success"
                                                        : "text-text-secondary",
                                                )}
                                            >
                                                {passed ? (
                                                    <Check
                                                        size={11}
                                                        className="shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <X
                                                        size={11}
                                                        className="shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <span>{rule.label}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Rule checklist — mobile only (inline) */}
            <ul
                className="grid grid-cols-2 gap-x-3 gap-y-0.5 sm:hidden"
                aria-label="Exigences du mot de passe"
            >
                {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password)
                    return (
                        <li
                            key={rule.id}
                            className={cn(
                                "flex items-center gap-2 text-xs transition-colors",
                                passed
                                    ? "text-feedback-success"
                                    : "text-text-secondary",
                            )}
                        >
                            {passed ? (
                                <Check
                                    size={12}
                                    className="shrink-0"
                                    aria-hidden="true"
                                />
                            ) : (
                                <X
                                    size={12}
                                    className="shrink-0"
                                    aria-hidden="true"
                                />
                            )}
                            <span>{rule.label}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export {
    PasswordStrengthMeter,
    PASSWORD_RULES,
    generateSecurePassword,
    type PasswordStrengthMeterProps,
}
