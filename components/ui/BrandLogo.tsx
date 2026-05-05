import { cn } from "@/lib/utils/cn"

type BrandLogoProps = {
    className?: string
    markClassName?: string
    textClassName?: string
    variant?: "primary" | "reverse" | "mono" | "light"
    showText?: boolean
}

export function BrandLogo({
    className,
    markClassName,
    textClassName,
    variant = "primary",
    showText = true,
}: BrandLogoProps) {
    const isReverse = variant === "reverse"
    const isMono = variant === "mono"
    const isLight = variant === "light"

    return (
        <span className={cn("inline-flex items-center gap-2.5", className)}>
            <svg
                className={cn("h-9 w-9 shrink-0", markClassName)}
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <rect
                    x="12"
                    y="12"
                    width="16"
                    height="49"
                    rx="8"
                    className={cn(isReverse || isLight ? "fill-white" : isMono ? "fill-text-primary" : "fill-brand-primary")}
                />
                <circle cx="20" cy="20.6" r="5.25" className={cn(isReverse || isLight ? "fill-brand-primary" : "fill-white")} />
                <circle cx="20" cy="34.3" r="5.25" className={cn(isReverse || isLight ? "fill-brand-primary" : "fill-white")} />
                <circle cx="20" cy="48" r="5.25" className={cn(isReverse || isLight ? "fill-brand-primary" : "fill-white")} />
                <rect
                    x="36.7"
                    y="18"
                    width="23"
                    height="4.2"
                    rx="2.1"
                    className={cn(isReverse || isLight ? "fill-white/45" : isMono ? "fill-text-primary/45" : "fill-brand-primary/45")}
                />
                <rect
                    x="36.7"
                    y="31"
                    width="28"
                    height="5"
                    rx="2.5"
                    className={cn(isReverse || isLight ? "fill-white" : isMono ? "fill-text-primary" : "fill-brand-primary")}
                />
                <rect
                    x="36.7"
                    y="45.4"
                    width="21.5"
                    height="4.2"
                    rx="2.1"
                    className={cn(isReverse || isLight ? "fill-white/65" : isMono ? "fill-text-primary/65" : "fill-brand-primary/65")}
                />
            </svg>
            {showText ? (
                <span
                    className={cn(
                        "font-[var(--font-poppins)] text-lg font-bold text-brand-primary",
                        (isReverse || isLight) && "text-white",
                        isMono && "text-text-primary",
                        textClassName,
                    )}
                >
                    WaitLight
                </span>
            ) : null}
        </span>
    )
}
