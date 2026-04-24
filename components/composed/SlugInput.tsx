"use client"

import { useState, useEffect, useId } from "react"
import { cn } from "@/lib/utils/cn"
import { Check, X, Loader2 } from "lucide-react"

type SlugInputProps = {
    value: string
    onChange: (value: string) => void
    baseUrl?: string
    /** Simulates async slug availability check */
    checkAvailability?: (slug: string) => Promise<boolean>
    className?: string
}

function SlugInput({
    value,
    onChange,
    baseUrl = "waitlight.app",
    checkAvailability,
    className,
}: SlugInputProps) {
    const id = useId()
    const [status, setStatus] = useState<
        "idle" | "checking" | "available" | "taken"
    >("idle")

    const sanitize = (raw: string) =>
        raw
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-/, "")
            .slice(0, 50)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitize(e.target.value)
        onChange(sanitized)
    }

    useEffect(() => {
        let cancelled = false

        if (!value || value.length < 3) {
            const t = setTimeout(() => { if (!cancelled) setStatus("idle") }, 0)
            return () => { cancelled = true; clearTimeout(t) }
        }

        if (!checkAvailability) {
            const t = setTimeout(() => { if (!cancelled) setStatus("available") }, 0)
            return () => { cancelled = true; clearTimeout(t) }
        }

        // Defer setState to avoid synchronous call inside effect body
        const timer = setTimeout(async () => {
            if (cancelled) return
            setStatus("checking")
            const available = await checkAvailability(value)
            if (!cancelled) setStatus(available ? "available" : "taken")
        }, 0)

        return () => { cancelled = true; clearTimeout(timer) }
    }, [value, checkAvailability])

    const statusIcon = {
        idle: null,
        checking: (
            <Loader2
                size={16}
                className="animate-spin text-text-secondary"
                aria-hidden="true"
            />
        ),
        available: (
            <Check
                size={16}
                className="text-feedback-success"
                aria-hidden="true"
            />
        ),
        taken: (
            <X size={16} className="text-feedback-error" aria-hidden="true" />
        ),
    }

    const borderColor =
        status === "available"
            ? "border-feedback-success"
            : status === "taken"
              ? "border-feedback-error"
              : "border-border-default"

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label
                htmlFor={id}
                className="text-sm font-medium text-text-primary"
            >
                Slug de votre établissement
            </label>

            <div className="flex items-center gap-0">
                <span className="flex h-11 items-center rounded-l-md border border-r-0 border-border-default bg-surface-base px-3 text-sm text-text-secondary">
                    {baseUrl}/
                </span>
                <div className="relative flex-1">
                    <input
                        id={id}
                        type="text"
                        value={value}
                        onChange={handleChange}
                        placeholder="boulangerie-martin"
                        aria-describedby={`${id}-hint`}
                        aria-invalid={status === "taken" ? true : undefined}
                        className={cn(
                            "h-11 w-full rounded-r-md border px-3 pr-9 text-base transition-colors",
                            "bg-surface-card text-text-primary placeholder:text-text-disabled",
                            "focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none",
                            borderColor,
                        )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {statusIcon[status]}
                    </span>
                </div>
            </div>

            <p
                id={`${id}-hint`}
                className="text-sm"
                role={status === "taken" ? "alert" : undefined}
            >
                {status === "idle" && value.length > 0 && value.length < 3 ? (
                    <span className="text-text-secondary">
                        Minimum 3 caractères.
                    </span>
                ) : status === "available" ? (
                    <span className="text-feedback-success">
                        Ce slug est disponible !
                    </span>
                ) : status === "taken" ? (
                    <span className="text-feedback-error">
                        Ce slug est déjà pris. Essayez un autre nom.
                    </span>
                ) : (
                    <span className="text-text-secondary">
                        Lettres minuscules, chiffres et tirets uniquement.
                    </span>
                )}
            </p>
        </div>
    )
}

export { SlugInput, type SlugInputProps }
