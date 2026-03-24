import type { Meta } from "@storybook/react"
import { LoginForm } from "@/components/sections/LoginForm"

// Server Actions are no-ops in Storybook — forms render but don't submit to a real server
const noopAction = async (_: FormData) => ({ data: null })
const noopSocial = async (_: "google" | "apple") => ({
    data: { url: "#" },
})

const meta = {
    title: "Sections/Auth/LoginForm",
    component: LoginForm,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component:
                    "Login form. Server actions are no-ops in Storybook — submitting the form has no effect.",
            },
        },
    },
    decorators: [
        (Story: React.ComponentType) => (
            <div className="w-full max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof LoginForm>

export default meta

export const Default = {
    args: { action: noopAction },
    render: () => <LoginForm action={noopAction} />,
}

export const WithSocial = {
    args: { action: noopAction },
    render: () => (
        <LoginForm
            action={noopAction}
            socialAction={noopSocial}
            enabledProviders={["google"]}
        />
    ),
}

export const WithError = {
    args: { action: noopAction },
    render: () => (
        <LoginForm
            action={noopAction}
            initialError="Adresse e-mail ou mot de passe incorrect."
        />
    ),
}

export const WithSuccess = {
    args: { action: noopAction },
    render: () => (
        <LoginForm
            action={noopAction}
            successMessage="Mot de passe réinitialisé avec succès. Vous pouvez vous connecter."
        />
    ),
}
