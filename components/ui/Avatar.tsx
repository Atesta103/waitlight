import { cn } from "@/lib/utils/cn"

type AvatarProps = {
    name: string
    className?: string
    size?: "sm" | "md" | "lg"
}

const avatarSizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
} as const

const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-orange-700",
] as const

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

function getColorFromName(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

function Avatar({ name, className, size = "md" }: AvatarProps) {
    return (
        <span
            role="img"
            aria-label={name}
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
                avatarSizes[size],
                getColorFromName(name),
                className,
            )}
        >
            {getInitials(name)}
        </span>
    )
}

export { Avatar, type AvatarProps }
