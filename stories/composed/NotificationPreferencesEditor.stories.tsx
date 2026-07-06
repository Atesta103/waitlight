import type { Meta, StoryObj } from "@storybook/react"
import { NotificationPreferencesEditor } from "@/components/composed/NotificationPreferencesEditor"

const meta = {
    title: "Composed/NotificationPreferencesEditor",
    component: NotificationPreferencesEditor,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    args: {
        initialChannels: { sound: true, vibrate: true, toast: true, push: true },
        initialSound: "arpeggio",
        initialApproachingPosition: { enabled: false, threshold: 3 },
        initialApproachingTime: { enabled: false, thresholdMin: 5 },
        showSaveButton: true,
    },
} satisfies Meta<typeof NotificationPreferencesEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ApproachingAlertsEnabled: Story = {
    args: {
        initialApproachingPosition: { enabled: true, threshold: 2 },
        initialApproachingTime: { enabled: true, thresholdMin: 10 },
    },
}

export const NoSaveButton: Story = {
    args: { showSaveButton: false },
}
