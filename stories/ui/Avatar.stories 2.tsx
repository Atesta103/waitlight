import type { Meta, StoryObj } from "@storybook/react"
import { Avatar } from "@/components/ui/Avatar"

const meta = {
    title: "UI/Avatar",
    component: Avatar,
    tags: ["autodocs"],
    argTypes: {
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
        },
    },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Initials: Story = {
    args: { name: "Marie Dupond", size: "md" },
}

export const WithImage: Story = {
    args: {
        name: "Photo",
        imageUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=waitlight",
        size: "md",
    },
}

export const Small: Story = {
    args: { name: "Lucas Martin", size: "sm" },
}

export const Large: Story = {
    args: { name: "Pierre Bernard", size: "lg" },
}

export const ColorVariants: Story = {
    args: { name: "Alice Dupond" },
    render: () => (
        <div className="flex flex-wrap gap-2">
            {[
                "Alice Dupond",
                "Bob Martin",
                "Charlie Bernard",
                "Diana Petit",
                "Eric Leroy",
                "Fanny Simon",
            ].map((name) => (
                <Avatar key={name} name={name} size="md" />
            ))}
        </div>
    ),
}
