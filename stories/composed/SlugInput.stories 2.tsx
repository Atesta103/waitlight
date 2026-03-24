"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { SlugInput } from "@/components/composed/SlugInput"
import { useState } from "react"

const meta = {
    title: "Composed/SlugInput",
    component: SlugInput,
    tags: ["autodocs"],
} satisfies Meta<typeof SlugInput>

export default meta
type StoryRender = StoryObj

function SlugWrapper({
    initialValue = "",
    available,
}: {
    initialValue?: string
    available?: boolean
}) {
    const [value, setValue] = useState(initialValue)
    return (
        <div className="w-80">
            <SlugInput
                value={value}
                onChange={setValue}
                checkAvailability={
                    available !== undefined
                        ? async () => available
                        : undefined
                }
            />
        </div>
    )
}

export const Empty: StoryRender = {
    render: () => <SlugWrapper />,
}

export const Available: StoryRender = {
    render: () => <SlugWrapper initialValue="boulangerie-martin" available={true} />,
}

export const Taken: StoryRender = {
    render: () => <SlugWrapper initialValue="cafe-paris" available={false} />,
}

export const TooShort: StoryRender = {
    render: () => <SlugWrapper initialValue="ab" />,
}
