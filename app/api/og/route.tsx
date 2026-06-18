import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get("title") ?? "WaitLight"
    const subtitle = searchParams.get("subtitle") ?? "La file d'attente digitale pour votre commerce."

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    background: "#0F1420",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "72px 80px",
                    fontFamily: "system-ui, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background glow */}
                <div
                    style={{
                        position: "absolute",
                        top: "-180px",
                        right: "-120px",
                        width: "640px",
                        height: "640px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-200px",
                        left: "-100px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                    }}
                />

                {/* Top — Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Logo mark — reprend la forme du favicon */}
                    <svg width="48" height="48" viewBox="0 0 120 120" fill="none">
                        <rect x="16.24" y="16.24" width="25.52" height="83.52" rx="12.76" fill="white" />
                        <circle cx="28.768" cy="34.22" r="4.06" fill="#0F1420" />
                        <circle cx="28.768" cy="57.42" r="4.06" fill="#0F1420" />
                        <circle cx="28.768" cy="80.62" r="4.06" fill="#0F1420" />
                        <rect x="58" y="29" width="35.96" height="6.728" rx="3.364" fill="white" fillOpacity="0.38" />
                        <rect x="58" y="49.88" width="47.56" height="8.12" rx="4.06" fill="white" />
                        <rect x="58" y="74.24" width="34.8" height="6.728" rx="3.364" fill="white" fillOpacity="0.62" />
                    </svg>
                    <span style={{ fontSize: "28px", fontWeight: "700", color: "#FFFFFF", letterSpacing: "-0.5px" }}>
                        WaitLight
                    </span>
                </div>

                {/* Middle — Main content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "820px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "rgba(99,102,241,0.15)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            borderRadius: "999px",
                            padding: "6px 16px",
                            width: "fit-content",
                        }}
                    >
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366F1" }} />
                        <span style={{ fontSize: "15px", color: "#A5B4FC", fontWeight: "600", letterSpacing: "0.05em" }}>
                            FILE D&apos;ATTENTE DIGITALE
                        </span>
                    </div>

                    <div
                        style={{
                            fontSize: "64px",
                            fontWeight: "800",
                            color: "#FFFFFF",
                            lineHeight: "1.1",
                            letterSpacing: "-2px",
                        }}
                    >
                        {title}
                    </div>

                    <div
                        style={{
                            fontSize: "24px",
                            color: "rgba(255,255,255,0.55)",
                            lineHeight: "1.5",
                            fontWeight: "400",
                        }}
                    >
                        {subtitle}
                    </div>
                </div>

                {/* Bottom — Features pills */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {["QR Code", "Temps réel", "Zéro installation", "Mini-jeux"].map((label) => (
                        <div
                            key={label}
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "999px",
                                padding: "8px 18px",
                                fontSize: "15px",
                                color: "rgba(255,255,255,0.7)",
                                fontWeight: "500",
                            }}
                        >
                            {label}
                        </div>
                    ))}
                    <div
                        style={{
                            marginLeft: "auto",
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.3)",
                            fontWeight: "500",
                        }}
                    >
                        waitlight.fr
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    )
}
