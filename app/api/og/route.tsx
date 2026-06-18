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
                    background: "#F8F9FA",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "64px 80px",
                    fontFamily: "system-ui, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glow indigo en haut à droite */}
                <div
                    style={{
                        position: "absolute",
                        top: "-160px",
                        right: "-160px",
                        width: "560px",
                        height: "560px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
                    }}
                />
                {/* Glow léger en bas à gauche */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-120px",
                        left: "40px",
                        width: "380px",
                        height: "380px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                    }}
                />

                {/* Top — Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Logo mark — reprend la forme du favicon */}
                    <svg width="44" height="44" viewBox="0 0 120 120" fill="none">
                        <rect x="16.24" y="16.24" width="25.52" height="83.52" rx="12.76" fill="#111827" />
                        <circle cx="28.768" cy="34.22" r="4.06" fill="#F8F9FA" />
                        <circle cx="28.768" cy="57.42" r="4.06" fill="#F8F9FA" />
                        <circle cx="28.768" cy="80.62" r="4.06" fill="#F8F9FA" />
                        <rect x="58" y="29" width="35.96" height="6.728" rx="3.364" fill="#111827" fillOpacity="0.3" />
                        <rect x="58" y="49.88" width="47.56" height="8.12" rx="4.06" fill="#111827" />
                        <rect x="58" y="74.24" width="34.8" height="6.728" rx="3.364" fill="#111827" fillOpacity="0.55" />
                    </svg>
                    <span style={{ fontSize: "26px", fontWeight: "700", color: "#111827", letterSpacing: "-0.5px" }}>
                        WaitLight
                    </span>
                </div>

                {/* Middle — Contenu principal */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "760px" }}>
                    {/* Badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#EEF2FF",
                            borderRadius: "999px",
                            padding: "6px 14px",
                        }}
                    >
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366F1" }} />
                        <span style={{ fontSize: "13px", color: "#6366F1", fontWeight: "700", letterSpacing: "0.06em" }}>
                            FILE D&apos;ATTENTE DIGITALE
                        </span>
                    </div>

                    {/* Titre */}
                    <div
                        style={{
                            fontSize: "68px",
                            fontWeight: "800",
                            color: "#111827",
                            lineHeight: "1.05",
                            letterSpacing: "-2.5px",
                        }}
                    >
                        {title}
                    </div>

                    {/* Sous-titre */}
                    <div
                        style={{
                            fontSize: "22px",
                            color: "#6B7280",
                            lineHeight: "1.5",
                            fontWeight: "400",
                        }}
                    >
                        {subtitle}
                    </div>
                </div>

                {/* Bottom — Pills + CTA */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                    {["QR Code", "Temps réel", "Zéro installation", "Mini-jeux"].map((label) => (
                        <div
                            key={label}
                            style={{
                                background: "#FFFFFF",
                                border: "1px solid #E5E7EB",
                                borderRadius: "999px",
                                padding: "7px 16px",
                                fontSize: "14px",
                                color: "#374151",
                                fontWeight: "500",
                            }}
                        >
                            {label}
                        </div>
                    ))}
                    {/* CTA pill indigo */}
                    <div
                        style={{
                            marginLeft: "auto",
                            background: "#6366F1",
                            borderRadius: "999px",
                            padding: "10px 24px",
                            fontSize: "16px",
                            color: "#FFFFFF",
                            fontWeight: "700",
                        }}
                    >
                        waitlight.fr →
                    </div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 },
    )
}
