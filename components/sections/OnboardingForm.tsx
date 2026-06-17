"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { ActiveLine } from "@/components/ui/ActiveLine"
import { Select } from "@/components/ui/Select"
import { SlugInput, type SlugStatus } from "@/components/composed/SlugInput"
import { cn } from "@/lib/utils/cn"
import { BusinessTypeSchema, type BusinessType } from "@/lib/validators/business"
import {
    Store,
    Link,
    Settings,
    ArrowRight,
    ArrowLeft,
    Check,
    Sparkles,
} from "lucide-react"

type OnboardingData = {
    name: string
    businessType: BusinessType
    slug: string
    maxCapacity: number
    welcomeMessage: string
}

type OnboardingFormProps = {
    onComplete?: (data: OnboardingData) => void
    checkSlugAvailability?: (slug: string) => Promise<boolean>
    isSubmitting?: boolean
    className?: string
}

const STEPS = [
    { label: "Établissement", icon: Store },
    { label: "Slug", icon: Link },
    { label: "Configuration", icon: Settings },
] as const

function slugify(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50)
}

function JoinPhoneMockup({ name, welcomeMessage }: { name: string; welcomeMessage: string }) {
    const displayName = name || "Votre commerce"
    const displayMessage = welcomeMessage || "Bienvenue ! Merci de patienter, nous vous accueillerons très bientôt."

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-[260px] shrink-0">
                {/* Phone frame */}
                <div className="bg-[#111827] rounded-[2.5rem] p-3 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.06)]">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#111827] rounded-b-3xl z-10" aria-hidden="true" />
                    {/* Screen */}
                    <div className="rounded-[2.1rem] overflow-hidden bg-[#F9FAFB] aspect-[9/19.5]">
                        {/* Status bar */}
                        <div className="bg-white flex justify-between items-center px-5 pt-7 pb-2 text-[9px] font-semibold text-[#6B7280]">
                            <span>9:41</span>
                            <span className="w-4 h-2 border border-[#6B7280] rounded-sm relative">
                                <span className="absolute inset-0.5 right-0.5 bg-[#10B981] rounded-sm" />
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-3 px-4 py-4 bg-[#F9FAFB] h-full">
                            {/* Store icon + name */}
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
                                    <Store size={22} className="text-[#6366F1]" aria-hidden="true" />
                                </div>
                                <p className="text-[11px] font-bold text-[#111827] leading-tight">{displayName}</p>
                            </div>

                            {/* Welcome message card */}
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

                            {/* Name input */}
                            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
                                <p className="text-[8px] text-[#9CA3AF] mb-1">Votre prénom</p>
                                <div className="h-1.5 w-20 rounded bg-[#E5E7EB]" />
                            </div>

                            {/* Consent */}
                            <div className="flex items-start gap-1.5">
                                <div className="mt-0.5 h-3 w-3 shrink-0 rounded border border-[#D1D5DB]" />
                                <p className="text-[7px] text-[#6B7280] leading-relaxed">
                                    J&apos;accepte que mon prénom soit utilisé pour gérer mon passage.
                                </p>
                            </div>

                            {/* CTA button */}
                            <div className="rounded-xl bg-[#6366F1] py-2.5 text-center">
                                <p className="text-[10px] font-bold text-white">Rejoindre la file</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function OnboardingForm({
    onComplete,
    checkSlugAvailability,
    isSubmitting = false,
    className,
}: OnboardingFormProps) {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [data, setData] = useState<OnboardingData>({
        name: "",
        businessType: "retail",
        slug: "",
        maxCapacity: 20,
        welcomeMessage: "",
    })
    const [errors, setErrors] = useState<
        Partial<Record<keyof OnboardingData, string>>
    >({})
    const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle")

    const validateStep = (): boolean => {
        const newErrors: Partial<Record<keyof OnboardingData, string>> = {}

        if (step === 0) {
            if (!data.name.trim()) newErrors.name = "Le nom est obligatoire."
            if (data.name.length > 100)
                newErrors.name = "100 caractères maximum."
            if (!data.businessType)
                newErrors.businessType = "Le type d'activité est requis."
        }

        if (step === 1) {
            if (!data.slug) newErrors.slug = "Le slug est obligatoire."
            if (data.slug.length < 3) newErrors.slug = "Minimum 3 caractères."
            if (data.slug.length >= 3 && slugStatus === "checking") {
                newErrors.slug = "Validation du slug en cours."
            }
            if (data.slug.length >= 3 && slugStatus === "taken") {
                newErrors.slug = "Ce slug est déjà pris."
            }
            if (data.slug.length >= 3 && slugStatus === "idle") {
                newErrors.slug = "Attendez la validation du slug."
            }
        }

        if (step === 2) {
            if (data.maxCapacity < 1)
                newErrors.maxCapacity = "Minimum 1 personne."
            if (data.maxCapacity > 500)
                newErrors.maxCapacity = "Maximum 500 personnes."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (!validateStep()) return
        if (step === 0 && !data.slug) {
            setData((d) => ({ ...d, slug: slugify(d.name) }))
        }
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1)
        } else {
            onComplete?.(data)
        }
    }

    const handleBack = () => {
        if (step === 0) {
            router.push("/")
            return
        }
        setStep((s) => Math.max(0, s - 1))
    }

    const isSlugStepBlocked =
        step === 1 && (data.slug.length < 3 || slugStatus !== "available")
    const isCheckingSlug = step === 1 && slugStatus === "checking"

    const isStep2 = step === 2

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Stepper — toujours pleine largeur */}
            <div className="flex flex-col gap-3">
                <ActiveLine value={step + 1} max={STEPS.length} label="Progression de l'onboarding" />
                <div className="flex items-start">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon
                        const isCompleted = i < step
                        const isCurrent = i === step
                        return (
                            <div key={s.label} className="flex flex-1 items-start">
                                {/* Connector before (not on first) */}
                                {i > 0 && (
                                    <div className="mt-4 h-px flex-1 bg-border-default" />
                                )}
                                {/* Dot + label stacked */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div
                                        className={cn(
                                            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                            isCompleted
                                                ? "bg-feedback-success text-text-inverse"
                                                : isCurrent
                                                  ? "bg-brand-primary text-text-inverse"
                                                  : "bg-border-default text-text-secondary",
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check size={16} aria-hidden="true" />
                                        ) : (
                                            <Icon size={16} aria-hidden="true" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "hidden text-xs sm:inline",
                                            isCurrent
                                                ? "font-medium text-text-primary"
                                                : "text-text-secondary",
                                        )}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                {/* Connector after (not on last) */}
                                {i < STEPS.length - 1 && (
                                    <div className="mt-4 h-px flex-1 bg-border-default" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Step content */}
            {isStep2 ? (
                /* Step 2 — two-column layout */
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
                    {/* Left — form + navigation */}
                    <div className="flex flex-col gap-4">
                        <Card className="flex-1">
                            <CardContent className="pt-4">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-lg font-semibold text-text-primary">
                                        Configurez votre file
                                    </h3>
                                    <Input
                                        label="Capacité maximale"
                                        type="number"
                                        min={1}
                                        max={500}
                                        value={data.maxCapacity}
                                        onChange={(e) =>
                                            setData((d) => ({
                                                ...d,
                                                maxCapacity: Number(e.target.value),
                                            }))
                                        }
                                        error={errors.maxCapacity}
                                        hint="Nombre maximum de personnes dans la file."
                                    />
                                    <Textarea
                                        label="Message d'accueil"
                                        placeholder="Bienvenue ! Merci de patienter, nous vous accueillerons très bientôt."
                                        value={data.welcomeMessage}
                                        onChange={(e) =>
                                            setData((d) => ({
                                                ...d,
                                                welcomeMessage: e.target.value,
                                            }))
                                        }
                                        hint="Affiché aux clients lorsqu'ils scannent votre QR code."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        {/* Navigation inside left column for step 2 */}
                        <div className="flex justify-between">
                            <Button variant="ghost" onClick={handleBack}>
                                <ArrowLeft size={16} aria-hidden="true" />
                                Retour
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                isLoading={isSubmitting}
                            >
                                <Check size={16} aria-hidden="true" />
                                Créer mon établissement
                            </Button>
                        </div>
                    </div>

                    {/* Right — phone mockup, sticky so it stays visible while scrolling */}
                    <div className="flex justify-center lg:sticky lg:top-8 lg:justify-center">
                        <JoinPhoneMockup
                            name={data.name}
                            welcomeMessage={data.welcomeMessage}
                        />
                    </div>
                </div>
            ) : (
                /* Steps 0 & 1 — centered narrow card */
                <div className="mx-auto w-full max-w-lg">
                    <Card>
                        <CardContent className="pt-4">
                            {step === 0 ? (
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-lg font-semibold text-text-primary">
                                        Nommez votre établissement
                                    </h3>
                                    <Input
                                        label="Nom du commerce"
                                        placeholder="Ex : Boulangerie Martin"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData((d) => ({
                                                ...d,
                                                name: e.target.value,
                                            }))
                                        }
                                        error={errors.name}
                                    />
                                    <Select
                                        label="Type d'activité"
                                        value={data.businessType}
                                        onChange={(e) =>
                                            setData((d) => ({
                                                ...d,
                                                businessType: BusinessTypeSchema.parse(
                                                    e.target.value,
                                                ),
                                            }))
                                        }
                                        options={[
                                            { value: "food", label: "Alimentaire" },
                                            { value: "healthcare", label: "Santé" },
                                            { value: "retail", label: "Commerce" },
                                            {
                                                value: "public_service",
                                                label: "Administration / services",
                                            },
                                        ]}
                                        error={errors.businessType}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-lg font-semibold text-text-primary">
                                        Choisissez votre slug
                                    </h3>
                                    <p className="text-sm text-text-secondary">
                                        C&apos;est l&apos;identifiant unique de votre établissement dans l&apos;URL partagée à vos clients.
                                    </p>
                                    <SlugInput
                                        value={data.slug}
                                        onChange={(slug) => {
                                            setData((d) => ({ ...d, slug }))
                                            setSlugStatus("idle")
                                            setErrors((current) => ({
                                                ...current,
                                                slug: undefined,
                                            }))
                                        }}
                                        checkAvailability={checkSlugAvailability}
                                        onStatusChange={setSlugStatus}
                                    />
                                    {errors.slug ? (
                                        <p className="text-sm text-feedback-error" role="alert">
                                            {errors.slug}
                                        </p>
                                    ) : null}
                                    {data.slug && (
                                        <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 py-2">
                                            <Link size={13} className="shrink-0 text-text-tertiary" aria-hidden="true" />
                                            <p className="truncate text-xs text-text-secondary">
                                                <span className="text-text-tertiary">waitlight.fr/</span>
                                                <span className="font-medium text-text-primary">{data.slug}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Navigation — steps 0 & 1 only (step 2 has nav inside left column) */}
            {!isStep2 && <div className="mx-auto flex w-full max-w-lg justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft size={16} aria-hidden="true" />
                    Retour
                </Button>
                <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={isSlugStepBlocked}
                    isLoading={
                        isCheckingSlug ||
                        (isSubmitting && step === STEPS.length - 1)
                    }
                >
                    {step === STEPS.length - 1 ? (
                        <>
                            <Check size={16} aria-hidden="true" />
                            Créer mon établissement
                        </>
                    ) : isCheckingSlug ? (
                        "Validation du slug..."
                    ) : (
                        <>
                            Suivant
                            <ArrowRight size={16} aria-hidden="true" />
                        </>
                    )}
                </Button>
            </div>}
        </div>
    )
}

export { OnboardingForm, type OnboardingFormProps, type OnboardingData }
