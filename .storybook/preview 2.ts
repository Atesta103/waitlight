import type { Preview } from "@storybook/react"
import "../app/globals.css"

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
