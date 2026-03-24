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
        })
    },
}

export default config
