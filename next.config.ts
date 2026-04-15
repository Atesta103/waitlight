import type { NextConfig } from "next"

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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval required for dev mode / Next.js app router client code
            "style-src 'self' 'unsafe-inline'",
            `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || "*"} wss://*.supabase.co https://*.supabase.co`,
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "frame-ancestors 'none'",
        ].join("; "),
    },
]

const nextConfig: NextConfig = {
    allowedDevOrigins: [
        "10.15.4.159",
        "*.ngrok-free.dev",
        "*.ngrok.io",
        "172.20.10.2",
        "10.24.249.200", // adresse ip partage de connexion helios
    ],
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "ngrok-skip-browser-warning", value: "true" },
                    ...securityHeaders,
                ],
            },
        ]
    },
}

export default nextConfig
