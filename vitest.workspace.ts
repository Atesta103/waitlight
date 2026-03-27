export default [
    "./vitest.unit.config.ts",
    {
        test: {
            name: "storybook",
            browser: {
                enabled: false,
            },
            include: ["stories/**/*.stories.@(js|jsx|ts|tsx)"],
            environment: "jsdom",
            globals: true,
        },
    },
]
