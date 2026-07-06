import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"

const securityHeaders = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
    {
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
            "style-src 'self' 'unsafe-inline'",
            `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || "*"} wss://*.supabase.co https://*.supabase.co`,
            `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co"}`,
            "font-src 'self' data:",
            "frame-ancestors 'none'",
        ].join("; "),
    },
]

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
            },
        ],
    },
    // Add your local dev IP in .env.local as ALLOWED_DEV_ORIGINS if needed
    allowedDevOrigins: [
        "*.ngrok-free.dev",
        "*.ngrok.io",
    ],
    async headers() {
        const baseHeaders = isDev
            ? [{ key: "ngrok-skip-browser-warning", value: "true" }]
            : []
        return [
            {
                source: "/(.*)",
                headers: [
                    ...baseHeaders,
                    ...securityHeaders,
                ],
            },
        ]
    },
}

export default nextConfig
