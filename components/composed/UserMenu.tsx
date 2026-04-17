"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { Dropdown } from "@/components/ui/Dropdown"
import { Avatar } from "@/components/ui/Avatar"
import { signOutAction } from "@/lib/actions/auth"
import { cn } from "@/lib/utils/cn"

type UserMenuProps = {
  name: string
  imageUrl?: string | null
  className?: string
  dropdownSide?: "top" | "bottom"
}

/**
 * Composed — avatar button in the header that opens a dropdown with
 * account actions (settings, sign out).
 */
function UserMenu({
  name,
  imageUrl,
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
            "flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-transparent hover:ring-brand-primary/40 transition-all",
          )}
          aria-label={`Menu de ${name}`}
        >
          <Avatar name={name} imageUrl={imageUrl ?? undefined} size="sm" />
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
