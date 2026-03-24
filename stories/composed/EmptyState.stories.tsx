import type { Meta, StoryObj } from "@storybook/react"
import { EmptyState } from "@/components/composed/EmptyState"
import { Button } from "@/components/ui/Button"
import { Users, BarChart2, Inbox } from "lucide-react"

const meta = {
    title: "Composed/EmptyState",
    component: EmptyState,
    tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>

export default meta
type StoryRender = StoryObj

export const NoQueue: StoryRender = {
    render: () => (
        <EmptyState
            icon={<Users size={28} />}
            title="Aucun client en attente"
            description="La file d'attente est vide. Les clients rejoindront via le QR code."
        />
    ),
}

export const NoAnalytics: StoryRender = {
    render: () => (
        <EmptyState
            icon={<BarChart2 size={28} />}
            title="Pas encore de données"
            description="Vos statistiques apparaîtront après votre premier service."
        />
    ),
}

export const WithAction: StoryRender = {
    render: () => (
        <EmptyState
            icon={<Inbox size={28} />}
            title="Aucun ticket trouvé"
            description="Aucun ticket ne correspond à vos filtres."
            action={<Button variant="secondary">Réinitialiser les filtres</Button>}
        />
    ),
}
