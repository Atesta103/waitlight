import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type AuthErrorBannerProps = {
    message: string
    className?: string
}

/**
 * Molecule — Dismissible error banner displayed at the top of an auth form
 * after a failed server action (e.g. wrong credentials, email already taken).
 *
 * Uses `role="alert"` so screen readers announce the error immediately
 * without requiring focus movement.
 */
function AuthErrorBanner({ message, className }: AuthErrorBannerProps) {
    return (
        <div
            role="alert"
            aria-live="assertive"
            className={cn(
                "flex items-start gap-3 rounded-md border border-feedback-error/30",
                "bg-feedback-error-bg px-4 py-3 text-sm text-feedback-error",
                className,
            )}
        >
            <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
            />
            <span>{message}</span>
        </div>
    )
}

export { AuthErrorBanner, type AuthErrorBannerProps }
