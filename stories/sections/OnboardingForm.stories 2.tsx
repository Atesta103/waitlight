import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingForm } from "@/components/sections/OnboardingForm"

const mockCheckSlug = async (slug: string) => {
    // Simulate availability check — all slugs except "taken" are available
    await new Promise((r) => setTimeout(r, 500))
    return slug !== "taken"
}

const meta = {
    title: "Sections/OnboardingForm",
    component: OnboardingForm,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    decorators: [
        (Story: React.ComponentType) => (
            <div className="w-full max-w-lg">
                <Story />
            </div>
        ),
    ],
    args: {
        checkSlugAvailability: mockCheckSlug,
        onComplete: (data: unknown) => alert(JSON.stringify(data, null, 2)),
    },
} satisfies Meta<typeof OnboardingForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Submitting: Story = {
    args: { isSubmitting: true },
}
