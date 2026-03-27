import type { Meta, StoryObj } from "@storybook/react"
import { SubscribeClient } from "@/app/subscribe/SubscribeClient"

const meta = {
    title: "Sections/SubscribeClient",
    component: SubscribeClient,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Subscription paywall page. Shows trial CTA, error banners (payment_failed, cancelled), and the portal button for past_due accounts.",
            },
        },
    },
} satisfies Meta<typeof SubscribeClient>

export default meta
type Story = StoryObj<typeof meta>

/** Default state — shown to a new merchant, no prior subscription. */
export const TrialCTA: Story = {
    name: "Default — Trial CTA",
    args: {
        error: null,
        subscription: null,
    },
}

/** Payment failed during trial → red error banner. */
export const PaymentFailed: Story = {
    name: "Error — Payment Failed",
    args: {
        error: "payment_failed",
        subscription: null,
    },
}

/** Merchant cancelled the Stripe Checkout flow → neutral info banner. */
export const Cancelled: Story = {
    name: "Error — Checkout Cancelled",
    args: {
        error: "cancelled",
        subscription: null,
    },
}

/** Active subscription in past_due state → portal button instead of checkout CTA. */
export const PastDue: Story = {
    name: "Status — Past Due (portal button)",
    args: {
        error: null,
        subscription: {
            id: "sub_test_001",
            merchant_id: "00000000-0000-0000-0000-000000000001",
            stripe_customer_id: "cus_test_001",
            stripe_subscription_id: "sub_stripe_001",
            stripe_price_id: "price_test_001",
            status: "past_due",
            trial_end: null,
            current_period_end: "2026-04-24T00:00:00Z",
            cancel_at_period_end: false,
            created_at: "2026-03-24T00:00:00Z",
            updated_at: "2026-03-24T00:00:00Z",
        },
    },
}
