import type { Meta, StoryObj } from "@storybook/react"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

const meta = {
    title: "UI/Card",
    component: Card,
    tags: ["autodocs"],
    argTypes: {
        as: {
            control: "select",
            options: ["div", "section", "article"],
        },
    },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { children: "Contenu de la carte." },
}

export const WithHeader: Story = {
    args: { children: "" },
    render: () => (
        <Card className="w-80">
            <CardHeader>
                <h2 className="text-lg font-bold text-text-primary">Titre</h2>
                <Button variant="ghost" size="sm">
                    Action
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-text-secondary">
                    Contenu de la carte avec un en-tête.
                </p>
            </CardContent>
        </Card>
    ),
}

export const FullExample: Story = {
    args: { children: "" },
    render: () => (
        <Card as="article" className="w-80">
            <CardHeader>
                <h2 className="text-base font-semibold text-text-primary">
                    Statistiques du jour
                </h2>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-brand-primary">47</p>
                <p className="text-sm text-text-secondary">clients servis</p>
            </CardContent>
        </Card>
    ),
}
