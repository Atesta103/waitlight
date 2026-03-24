import type { Meta, StoryObj } from "@storybook/react"
import { Skeleton } from "@/components/ui/Skeleton"

const meta = {
    title: "UI/Skeleton",
    component: Skeleton,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const TextLine: Story = {
    args: { className: "h-4 w-48" },
}

export const Circle: Story = {
    args: { className: "h-10 w-10 rounded-full" },
}

export const Card: Story = {
    args: { className: "h-24 w-80" },
}

export const TicketCardSkeleton: Story = {
    render: () => (
        <div className="flex w-full max-w-sm items-center gap-4 rounded-lg border border-border-default bg-surface-card p-4 shadow-sm">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-24 rounded-full" />
        </div>
    ),
}

export const QueueListSkeleton: Story = {
    render: () => (
        <div className="flex w-full max-w-sm flex-col gap-3">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="flex w-full items-center gap-4 rounded-lg border border-border-default bg-surface-card p-4"
                >
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            ))}
        </div>
    ),
}
