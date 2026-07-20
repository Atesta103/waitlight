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
        value: "camera=(), microphone=(), geolocation=(self)",
    },
    {
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            // @vercel/analytics and @vercel/speed-insights inject their script
            // tag from this host at mount; without it listed here they load
            // nothing and report nothing, on every route.
            `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
            "style-src 'self' 'unsafe-inline'",
            // tiles.openfreemap.org serves the /carte vector style, tiles,
            // glyphs and sprite sheet; MapLibre fetches all of them by XHR.
            `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || "*"} wss://*.supabase.co https://*.supabase.co https://api-adresse.data.gouv.fr https://tiles.openfreemap.org`,
            `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co"} https://tiles.openfreemap.org`,
            // MapLibre decodes vector tiles in a worker it creates from a blob.
            "worker-src blob:",
            "child-src blob:",
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
