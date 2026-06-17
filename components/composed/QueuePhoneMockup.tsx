"use client"

import { useState } from "react"
import { Store, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { CustomerWaitView } from "@/components/sections/CustomerWaitView"

type Tab = "welcome" | "thankyou"

type Props = {
    name: string
    welcomeMessage: string
    thankYouTitle: string
    thankYouMessage: string
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-[240px] max-w-full shrink-0">
            <div className="bg-[#111827] rounded-[2.5rem] p-3 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.06)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#111827] rounded-b-3xl z-10" aria-hidden="true" />
                <div className="rounded-[2.1rem] overflow-hidden bg-[#F9FAFB] aspect-[9/19.5] flex flex-col">
                    <div className="bg-white flex justify-between items-center px-5 pt-6 pb-2 text-[9px] font-semibold text-[#6B7280] shrink-0">
                        <span>9:41</span>
                        <span className="w-4 h-2 border border-[#6B7280] rounded-sm relative">
                            <span className="absolute inset-0.5 right-0.5 bg-[#10B981] rounded-sm" />
                        </span>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden bg-[#F9FAFB]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

function WelcomeScreen({ name, welcomeMessage }: { name: string; welcomeMessage: string }) {
    const displayName = name || "Votre commerce"
    const displayMessage = welcomeMessage || "Bienvenue ! Merci de patienter, nous vous accueillerons très bientôt."

    return (
        <div className="flex flex-col gap-3 px-4 py-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
                    <Store size={22} className="text-[#6366F1]" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-bold text-[#111827] leading-tight">{displayName}</p>
            </div>
            <div className="flex items-start gap-2 rounded-2xl border border-[#E0E7FF] bg-white p-3 shadow-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF]">
                    <Sparkles size={11} className="text-[#6366F1]" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-[#6366F1]">
                        Message d&apos;accueil
                    </p>
                    <p className="text-[9px] leading-relaxed text-[#111827]">
                        {displayMessage}
                    </p>
                </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
                <p className="text-[8px] text-[#9CA3AF] mb-1">Votre prénom</p>
                <div className="h-1.5 w-20 rounded bg-[#E5E7EB]" />
            </div>
            <div className="flex items-start gap-1.5">
                <div className="mt-0.5 h-3 w-3 shrink-0 rounded border border-[#D1D5DB]" />
                <p className="text-[7px] text-[#6B7280] leading-relaxed">
                    J&apos;accepte que mon prénom soit utilisé pour gérer mon passage.
                </p>
            </div>
            <div className="rounded-xl bg-[#6366F1] py-2.5 text-center">
                <p className="text-[10px] font-bold text-white">Rejoindre la file</p>
            </div>
        </div>
    )
}


export function QueuePhoneMockup({ name, welcomeMessage, thankYouTitle, thankYouMessage }: Props) {
    const [tab, setTab] = useState<Tab>("welcome")

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Tab switcher */}
            <div className="flex rounded-lg border border-border-default bg-surface-base p-0.5">
                {([
                    { value: "welcome" as Tab, label: "Accueil" },
                    { value: "thankyou" as Tab, label: "Remerciement" },
                ] as const).map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setTab(value)}
                        className={cn(
                            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                            tab === value
                                ? "bg-surface-card text-text-primary shadow-sm border border-border-default"
                                : "text-text-secondary hover:text-text-primary",
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <PhoneFrame>
                {tab === "welcome" ? (
                    <WelcomeScreen name={name} welcomeMessage={welcomeMessage} />
                ) : (
                    <CustomerWaitView
                        status="done"
                        position={null}
                        totalWaiting={null}
                        estimatedWaitMinutes={null}
                        connectionState="connected"
                        customerName="Marie"
                        slug=""
                        ticketId="preview"
                        thankYouTitle={thankYouTitle}
                        thankYouMessage={thankYouMessage}
                        className="h-full justify-center gap-3 px-4"
                    />
                )}
            </PhoneFrame>
        </div>
    )
}
