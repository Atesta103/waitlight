import type { Metadata } from "next"
import { MarketingNav } from "@/components/sections/marketing/MarketingNav"
import { HeroSection } from "@/components/sections/marketing/HeroSection"
import { BentoFeaturesGrid } from "@/components/sections/marketing/BentoFeaturesGrid"
import { FlowCarouselSection } from "@/components/sections/marketing/FlowCarouselSection"
import { UseCasesGrid } from "@/components/sections/marketing/UseCasesGrid"
import { PricingSection } from "@/components/sections/marketing/PricingSection"
import { FaqSection } from "@/components/sections/marketing/FaqSection"
import { MarketingFooter } from "@/components/sections/marketing/MarketingFooter"

export const metadata: Metadata = {
    title: "Wait-Light — La file d'attente digitale pour votre commerce",
    description:
        "Transformez l'attente en expérience. Wait-Light est le logiciel de file d'attente digitale pour restaurants, cliniques, SAV et événements. Scan, attente libre, notification.",
    keywords: [
        "file d'attente digitale",
        "logiciel file d'attente",
        "qr code attente",
        "gestion d'affluence",
        "waitlight",
        "virtual queue",
    ],
    openGraph: {
        title: "Wait-Light — L'attente devient un plaisir.",
        description:
            "File d'attente digitale par QR Code. Zéro installation, notifications en temps réel, marque blanche.",
        type: "website",
        siteName: "Wait-Light",
        locale: "fr_FR",
    },
    alternates: {
        canonical: "/",
    },
}

export default function HomePage() {
    return (
        <main className="light min-h-screen bg-[#F8F9FA] text-[#111827]">
            <MarketingNav />
            <HeroSection id="hero" />
            <BentoFeaturesGrid id="fonctionnalites" />
            <FlowCarouselSection id="demo" />
            <UseCasesGrid id="secteurs" />
            <PricingSection id="tarifs" />
            <FaqSection id="faq" />
            <MarketingFooter />
        </main>
    )
}
