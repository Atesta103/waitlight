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
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <rect
                    x="16.24"
                    y="16.24"
                    width="25.52"
                    height="83.52"
                    rx="12.76"
                    className={cn(isReverse || isLight ? "fill-white" : isMono ? "fill-text-primary" : "fill-brand-primary")}
                />
                <circle cx="28.768" cy="34.22" r="4.06" className={cn(isReverse || isLight ? "fill-brand-primary" : "fill-white")} />
                <circle cx="28.768" cy="57.42" r="4.06" className={cn(isReverse || isLight ? "fill-brand-primary" : "fill-white")} />
                <circle cx="28.768" cy="80.62" r="4.06" className={cn(isReverse || isLight ? "fill-brand-primary" : "fill-white")} />
                <rect
                    x="58"
                    y="29"
                    width="35.96"
                    height="6.728"
                    rx="3.364"
                    className={cn(isReverse || isLight ? "fill-white/40" : isMono ? "fill-text-primary/40" : "fill-brand-primary/40")}
                />
                <rect
                    x="58"
                    y="49.88"
                    width="47.56"
                    height="8.12"
                    rx="4.06"
                    className={cn(isReverse || isLight ? "fill-white" : isMono ? "fill-text-primary" : "fill-brand-primary")}
                />
                <rect
                    x="58"
                    y="74.24"
                    width="34.8"
                    height="6.728"
                    rx="3.364"
                    className={cn(isReverse || isLight ? "fill-white/60" : isMono ? "fill-text-primary/60" : "fill-brand-primary/60")}
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
