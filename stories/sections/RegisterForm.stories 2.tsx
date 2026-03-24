import type { Meta } from "@storybook/react"
import { RegisterForm } from "@/components/sections/RegisterForm"

const noopAction = async (_: FormData) => ({ data: null as null })
const noopSocial = async (_: "google" | "apple") => ({ data: { url: "#" } })

const meta = {
    title: "Sections/Auth/RegisterForm",
    component: RegisterForm,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    decorators: [
        (Story: React.ComponentType) => (
            <div className="w-full max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof RegisterForm>

export default meta

export const Default = {
    args: { action: noopAction },
    render: () => <RegisterForm action={noopAction} />,
}

export const WithSocial = {
    args: { action: noopAction },
    render: () => (
        <RegisterForm action={noopAction} socialAction={noopSocial} enabledProviders={["google"]} />
    ),
}
