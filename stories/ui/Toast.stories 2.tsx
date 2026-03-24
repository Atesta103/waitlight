import type { Meta, StoryObj } from "@storybook/react"
import { Toast } from "@/components/ui/Toast"

const meta = {
    title: "UI/Toast",
    component: Toast,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    argTypes: {
        variant: {
            control: "select",
            options: ["called", "advance", "info", "error"],
        },
        duration: { control: { type: "number" } },
    },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const Called: Story = {
    args: {
        variant: "called",
        title: "C'est votre tour !",
        description: "Rendez-vous au comptoir.",
        duration: 0,
    },
}

export const Advance: Story = {
    args: {
        variant: "advance",
        title: "↑ Vous avancez !",
        description: "Plus que 2 personnes avant vous.",
        duration: 0,
    },
}

export const Info: Story = {
    args: {
        variant: "info",
        title: "Paramètres enregistrés",
        description: "Vos modifications ont été sauvegardées.",
        duration: 0,
    },
}

export const Error: Story = {
    args: {
        variant: "error",
        title: "Erreur",
        description: "Impossible d'appeler ce ticket. Réessayez.",
        duration: 0,
    },
}

export const AllVariants: StoryRender = {
    render: () => (
        <div className="flex flex-col gap-3">
            <Toast variant="called" title="C'est votre tour !" duration={0} />
            <Toast variant="advance" title="↑ Vous avancez !" duration={0} />
            <Toast variant="info" title="Paramètres enregistrés" duration={0} />
            <Toast variant="error" title="Erreur de connexion" duration={0} />
        </div>
    ),
}
