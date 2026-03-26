import type { StorybookConfig } from "@storybook/react-vite"
import path from "path"

const config: StorybookConfig = {
    stories: [
        "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
        "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
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
            },
        })
    },
}

export default config
