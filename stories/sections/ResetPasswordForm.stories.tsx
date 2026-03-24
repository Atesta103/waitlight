import type { Meta } from "@storybook/react"
import { ResetPasswordForm } from "@/components/sections/ResetPasswordForm"

const noopAction = async (_: FormData) => ({ data: null as unknown })

const meta = {
    title: "Sections/Auth/ResetPasswordForm",
    component: ResetPasswordForm,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    decorators: [
        (Story: React.ComponentType) => (
            <div className="w-full max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ResetPasswordForm>

export default meta

export const Default = {
    args: { action: noopAction },
    render: () => <ResetPasswordForm action={noopAction} />,
}
