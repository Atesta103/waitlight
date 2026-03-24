"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { Dropdown } from "@/components/ui/Dropdown"
import { Button } from "@/components/ui/Button"
import { MoreVertical, Trash2, Edit, Copy } from "lucide-react"

const meta = {
    title: "UI/Dropdown",
    component: Dropdown,
    tags: ["autodocs"],
} satisfies Meta<typeof Dropdown>

export default meta
// All dropdown stories use render — trigger/items contain ReactNode so render-only is best
type StoryRender = StoryObj

export const Default: StoryRender = {
    render: () => (
        <Dropdown
            trigger={
                <Button variant="ghost" size="md" aria-label="Options">
                    <MoreVertical size={18} />
                </Button>
            }
            items={[
                { label: "Modifier", icon: <Edit size={16} />, onClick: () => {} },
                { label: "Dupliquer", icon: <Copy size={16} />, onClick: () => {} },
                {
                    label: "Supprimer",
                    icon: <Trash2 size={16} />,
                    variant: "destructive",
                    onClick: () => {},
                },
            ]}
        />
    ),
}

export const WithDisabledItem: StoryRender = {
    render: () => (
        <Dropdown
            trigger={<Button variant="secondary">Options</Button>}
            items={[
                { label: "Appeler", onClick: () => {} },
                { label: "Terminer", onClick: () => {}, disabled: true },
                {
                    label: "Annuler le ticket",
                    icon: <Trash2 size={16} />,
                    variant: "destructive",
                    onClick: () => {},
                },
            ]}
        />
    ),
}

export const LeftAligned: StoryRender = {
    render: () => (
        <div className="flex w-80 justify-end">
            <Dropdown
                align="left"
                trigger={<Button variant="ghost">Menu gauche</Button>}
                items={[
                    { label: "Item 1", onClick: () => {} },
                    { label: "Item 2", onClick: () => {} },
                ]}
            />
        </div>
    ),
}
