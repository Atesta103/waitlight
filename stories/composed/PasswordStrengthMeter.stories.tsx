import { useState } from "react"
import type { Meta } from "@storybook/react"
import { PasswordStrengthMeter } from "@/components/composed/PasswordStrengthMeter"
import { PasswordInput } from "@/components/composed/PasswordInput"

const meta = {
    title: "Composed/PasswordStrengthMeter",
    component: PasswordStrengthMeter,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof PasswordStrengthMeter>

export default meta

export const Empty = {
    args: { password: "" },
    render: () => <PasswordStrengthMeter password="" />,
}

export const Weak = {
    args: { password: "abc" },
    render: () => <PasswordStrengthMeter password="abc" />,
}

export const Fair = {
    args: { password: "Abcdef1" },
    render: () => <PasswordStrengthMeter password="Abcdef1" />,
}

export const Strong = {
    args: { password: "Correct!H0rse_Battery" },
    render: () => <PasswordStrengthMeter password="Correct!H0rse_Battery" />,
}

export const Interactive = {
    args: { password: "" },
    render: function InteractiveDemo() {
        const [pwd, setPwd] = useState("")
        return (
            <div className="flex flex-col gap-3 w-72">
                <PasswordInput
                    label="Mot de passe"
                    placeholder="Tapez un mot de passe…"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                />
                <PasswordStrengthMeter password={pwd} />
            </div>
        )
    },
}
