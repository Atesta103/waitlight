"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { Toggle } from "@/components/ui/Toggle"
import { useState } from "react"

const meta = {
    title: "UI/Toggle",
    component: Toggle,
    tags: ["autodocs"],
    argTypes: {
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Toggle>

export default meta

// Render-only stories don't need args since Toggle requires both checked + onChange
type StoryRender = StoryObj

function ToggleWrapper(props: { label: string; defaultChecked?: boolean; disabled?: boolean }) {
    const [checked, setChecked] = useState(props.defaultChecked ?? false)
    return (
        <Toggle
            checked={checked}
            onChange={setChecked}
            label={props.label}
            disabled={props.disabled}
        />
    )
}

export const Off: StoryRender = {
    render: () => <ToggleWrapper label="Activer les notifications" defaultChecked={false} />,
}

export const On: StoryRender = {
    render: () => <ToggleWrapper label="File ouverte" defaultChecked={true} />,
}

export const Disabled: StoryRender = {
    render: () => <ToggleWrapper label="Option indisponible" disabled />,
}

export const AllStates: StoryRender = {
    render: () => (
        <div className="flex flex-col gap-4">
            <ToggleWrapper label="Notifications push (désactivé)" defaultChecked={false} />
            <ToggleWrapper label="Auto-fermeture de la file (activé)" defaultChecked={true} />
            <ToggleWrapper label="Option indisponible" disabled />
        </div>
    ),
}
