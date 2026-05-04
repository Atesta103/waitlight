"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Select } from "@/components/ui/Select"
import { SlugInput } from "@/components/composed/SlugInput"
import { cn } from "@/lib/utils/cn"
import { BusinessTypeSchema, type BusinessType } from "@/lib/validators/business"
import {
    Store,
    Link,
    Settings,
    ArrowRight,
    ArrowLeft,
    Check,
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

function OnboardingForm({
    onComplete,
    checkSlugAvailability,
    isSubmitting = false,
    className,
}: OnboardingFormProps) {
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
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1)
        } else {
            onComplete?.(data)
        }
    }

    const handleBack = () => {
        setStep((s) => Math.max(0, s - 1))
    }

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Stepper */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon
                        const isCompleted = i < step
                        const isCurrent = i === step
                        return (
                            <div
                                key={s.label}
                                className="flex flex-1 items-center gap-2"
                            >
                                <div
                                    className={cn(
                                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
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
                                        "hidden text-sm sm:inline",
                                        isCurrent
                                            ? "font-medium text-text-primary"
                                            : "text-text-secondary",
                                    )}
                                >
                                    {s.label}
                                </span>
                                {i < STEPS.length - 1 ? (
                                    <div className="mx-2 h-px flex-1 bg-border-default" />
                                ) : null}
                            </div>
                        )
                    })}
                </div>
                <ProgressBar value={step + 1} max={STEPS.length} size="sm" />
            </div>

            {/* Step content */}
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
                    ) : step === 1 ? (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-text-primary">
                                Choisissez votre slug
                            </h3>
                            <p className="text-sm text-text-secondary">
                                C&apos;est l&apos;adresse que vos clients
                                utiliseront pour accéder à votre file
                                d&apos;attente.
                            </p>
                            <SlugInput
                                value={data.slug}
                                onChange={(slug) =>
                                    setData((d) => ({ ...d, slug }))
                                }
                                checkAvailability={checkSlugAvailability}
                            />
                            {errors.slug ? (
                                <p
                                    className="text-sm text-feedback-error"
                                    role="alert"
                                >
                                    {errors.slug}
                                </p>
                            ) : null}
                        </div>
                    ) : (
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
                                placeholder="Bienvenue ! Merci de patienter, votre tour arrive."
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
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 0}
                >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Retour
                </Button>
                <Button
                    variant="primary"
                    onClick={handleNext}
                    isLoading={isSubmitting && step === STEPS.length - 1}
                >
                    {step === STEPS.length - 1 ? (
                        <>
                            <Check size={16} aria-hidden="true" />
                            Créer mon établissement
                        </>
                    ) : (
                        <>
                            Suivant
                            <ArrowRight size={16} aria-hidden="true" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export { OnboardingForm, type OnboardingFormProps, type OnboardingData }
