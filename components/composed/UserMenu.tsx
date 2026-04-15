"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { Dropdown } from "@/components/ui/Dropdown"
import { signOutAction } from "@/lib/actions/auth"
import { cn } from "@/lib/utils/cn"

type UserMenuProps = {
    name: string
    className?: string
    dropdownSide?: "top" | "bottom"
}

/** Extracts up to 2 initials from a name. */
function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
}

/**
 * Composed — avatar button in the header that opens a dropdown with
 * account actions (settings, sign out).
 */
function UserMenu({
    name,
    className,
    dropdownSide = "bottom",
}: UserMenuProps) {
    const router = useRouter()

    return (
        <Dropdown
            align="right"
            side={dropdownSide}
            className={className}
            trigger={
                <span
                    className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white",
                        "ring-2 ring-transparent hover:ring-brand-primary/40 transition-all",
                    )}
                    aria-label={`Menu de ${name}`}
                >
                    {getInitials(name)}
                </span>
            }
            items={[
                {
                    label: name,
                    disabled: true,
                    onClick: () => {},
                },
                {
                    label: "Paramètres",
                    icon: <Settings size={15} />,
                    onClick: () => router.push("/dashboard/settings"),
                },
                {
                    label: "Se déconnecter",
                    icon: <LogOut size={15} />,
                    variant: "destructive",
                    onClick: async () => {
                        await signOutAction()
                    },
                },
            ]}
        />
    )
}

export { UserMenu }
