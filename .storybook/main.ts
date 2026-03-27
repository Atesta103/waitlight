import type { StorybookConfig } from "@storybook/react-vite"
import path from "path"

const config: StorybookConfig = {
    stories: [
        path.join(__dirname, "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)").replace(/\\/g, "/"),
        path.join(__dirname, "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)").replace(/\\/g, "/"),
    ],
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
    ],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    staticDirs: ["../public"],
    async viteFinal(config) {
        const { mergeConfig } = await import("vite")
        return mergeConfig(config, {
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, ".."),
                    "@/lib/actions/admin": path.resolve(__dirname, "mocks/admin-actions-mock.ts"),
                    "@/lib/actions/billing": path.resolve(__dirname, "mocks/billing-actions-mock.ts"),
                    "@/lib/actions/queue": path.resolve(__dirname, "mocks/queue-actions-mock.ts"),
                    "@/lib/actions/analytics": path.resolve(__dirname, "mocks/analytics-actions-mock.ts"),
                    "@/lib/actions/qr": path.resolve(__dirname, "mocks/qr-actions-mock.ts"),
                    "@/lib/actions/auth": path.resolve(__dirname, "mocks/auth-actions-mock.ts"),
                    "@/lib/actions/settings": path.resolve(__dirname, "mocks/settings-actions-mock.ts"),
                    "stripe": path.resolve(__dirname, "mocks/stripe-mock.ts"),
                },
            },
            define: {
                "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co"
                ),
                "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_anon_key"
                ),
                "process.env.NEXT_PUBLIC_BASE_URL": JSON.stringify(
                    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
                ),
                "process.env.SUPABASE_SERVICE_ROLE_KEY": JSON.stringify(
                    process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key_for_storybook"
                ),
                "process.env.STRIPE_SECRET_KEY": JSON.stringify(
                    process.env.STRIPE_SECRET_KEY || "dummy_stripe_key"
                ),
                "process.env.STRIPE_PRICE_ID": JSON.stringify(
                    process.env.STRIPE_PRICE_ID || "dummy_price_id"
                ),
                "__dirname": JSON.stringify("/"),
            },
        })
    },
}

export default config
