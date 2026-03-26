import type { Preview } from "@storybook/react"
import "../app/globals.css"

// Mock process.env for components relying on it (e.g. QRCodeDisplay)
if (typeof window !== "undefined") {
    window.process = window.process || {}
    window.process.env = window.process.env || {}
    window.process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000"
    window.process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy_key_for_storybook"
    window.process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy.supabase.co"
    window.process.env.STRIPE_SECRET_KEY = "dummy_stripe_key"
}


const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            default: "light",
            values: [
                { name: "light", value: "#f9fafb" },
                { name: "white", value: "#ffffff" },
                { name: "dark", value: "#111827" },
            ],
        },
        layout: "centered",
        nextjs: {
            appDirectory: true,
        },
    },
}

export default preview
