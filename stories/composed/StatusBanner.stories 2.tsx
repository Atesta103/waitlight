import type { Meta, StoryObj } from "@storybook/react"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { Button } from "@/components/ui/Button"

const meta = {
    title: "Composed/StatusBanner",
    component: StatusBanner,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["called", "done", "closed", "full", "error", "next"],
        },
    },
} satisfies Meta<typeof StatusBanner>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const Called: Story = {
    args: {
        variant: "called",
        title: "C'est votre tour ! 🎉",
        description: "Rendez-vous au comptoir pour récupérer votre commande.",
    },
}

export const Next: Story = {
    args: {
        variant: "next",
        title: "Vous êtes presque là !",
        description: "Préparez-vous, c'est bientôt votre tour.",
    },
}

export const Done: Story = {
    args: {
        variant: "done",
        title: "Commande terminée",
        description: "Merci pour votre visite. À bientôt !",
    },
}

export const Closed: Story = {
    args: {
        variant: "closed",
        title: "File fermée",
        description: "Cet établissement n'accepte plus de clients pour le moment.",
    },
}

export const Full: Story = {
    args: {
        variant: "full",
        title: "File complète",
        description: "La file d'attente est pleine. Réessayez dans quelques instants.",
    },
}

export const Error: Story = {
    args: {
        variant: "error",
        title: "Une erreur est survenue",
        description: "Impossible de récupérer votre position. Réessayez.",
    },
}

export const WithAction: StoryRender = {
    render: () => (
        <StatusBanner
            variant="called"
            title="C'est votre tour ! 🎉"
            description="Rendez-vous au comptoir."
        >
            <Button variant="primary">J'arrive !</Button>
        </StatusBanner>
    ),
}
