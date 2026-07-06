import type { Meta, StoryObj } from "@storybook/react"
import { MarketingNav } from "@/components/sections/marketing/MarketingNav"

const meta = {
    title: "Marketing/MarketingNav",
    component: MarketingNav,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MarketingNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <div style={{ height: "200px" }}>
            <MarketingNav />
        </div>
    ),
}
