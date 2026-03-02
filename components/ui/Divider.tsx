import { cn } from "@/lib/utils/cn"

type DividerProps = {
    label?: string
    className?: string
}

/**
 * Atom — Horizontal rule with an optional centred text label.
 * Used primarily in auth layouts to separate form sections
 * (e.g. "ou continuer avec").
 */
function Divider({ label, className }: DividerProps) {
    return (
        <div
            role="separator"
            aria-label={label}
            className={cn("flex items-center gap-3", className)}
        >
            <span
                className="h-px flex-1 bg-border-default"
                aria-hidden="true"
            />
            {label ? (
                <span className="shrink-0 text-xs font-medium text-text-secondary uppercase tracking-wide">
                    {label}
                </span>
            ) : null}
            <span
                className="h-px flex-1 bg-border-default"
                aria-hidden="true"
            />
        </div>
    )
}

export { Divider, type DividerProps }
