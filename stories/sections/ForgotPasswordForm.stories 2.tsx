import type { Meta } from "@storybook/react"
import { ForgotPasswordForm } from "@/components/sections/ForgotPasswordForm"

const noopAction = async (_: FormData) => ({ data: null as unknown })

const meta = {
    title: "Sections/Auth/ForgotPasswordForm",
    component: ForgotPasswordForm,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    decorators: [
        (Story: React.ComponentType) => (
            <div className="w-full max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ForgotPasswordForm>

export default meta

export const Default = {
    args: { action: noopAction },
    render: () => <ForgotPasswordForm action={noopAction} />,
}
