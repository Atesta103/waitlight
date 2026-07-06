import type { Meta, StoryObj } from "@storybook/react"
import { ScheduleEditor } from "@/components/composed/ScheduleEditor"

const meta = {
    title: "Composed/ScheduleEditor",
    component: ScheduleEditor,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    args: {
        initialSchedule: null,
        showSaveButton: true,
    },
} satisfies Meta<typeof ScheduleEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Disabled: Story = {}

export const WithWeeklyHours: Story = {
    args: {
        initialSchedule: {
            weekly: {
                "0": { open: "09:00", close: "18:00" },
                "1": { open: "09:00", close: "18:00" },
                "2": { open: "09:00", close: "18:00" },
                "3": { open: "09:00", close: "18:00" },
                "4": { open: "09:00", close: "20:00" },
                "5": { open: "10:00", close: "20:00" },
                "6": { open: "10:00", close: "13:00" },
            },
            exceptions: [],
        },
    },
}

export const NoSaveButton: Story = {
    args: { showSaveButton: false },
}
