import type { Meta, StoryObj } from "@storybook/react"

const meta = {
    title: "Design Tokens/Typography",
    tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj

export const TypeScale: Story = {
    render: () => (
        <div className="flex flex-col gap-6 p-6 max-w-2xl">
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">text-3xl / Bold</p>
                <p className="text-3xl font-bold text-text-primary">Rejoignez la file</p>
            </div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">text-2xl / Bold</p>
                <p className="text-2xl font-bold text-text-primary">File d'attente</p>
            </div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">text-xl / Semibold</p>
                <p className="text-xl font-semibold text-text-primary">Paramètres de la file</p>
            </div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">text-lg / Semibold</p>
                <p className="text-lg font-semibold text-text-primary">Votre position : #3</p>
            </div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">text-base / Medium</p>
                <p className="text-base font-medium text-text-primary">Marie Dupond</p>
            </div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">text-sm / Regular (secondary)</p>
                <p className="text-sm text-text-secondary">Attente depuis 14:22</p>
            </div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">text-xs / Medium (disabled)</p>
                <p className="text-xs font-medium text-text-disabled">QR code · Prochain code dans 12s</p>
            </div>
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-disabled">Monospace</p>
                <p className="font-mono text-sm text-text-secondary">waitlight.app/boulangerie-martin</p>
            </div>
        </div>
    ),
}
