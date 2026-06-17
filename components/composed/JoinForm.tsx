"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { cn } from "@/lib/utils/cn"
import { checkNameAction } from "@/lib/actions/queue"
import { getBusinessWording } from "@/lib/utils/business-wording"

type JoinFormProps = {
    onSubmit: (data: { customerName: string; consent: boolean }) => void
    isLoading?: boolean
    /** Merchant slug — used for per-merchant name ban filtering */
    slug?: string
    businessType?: string | null
    className?: string
}

function JoinForm({
    onSubmit,
    isLoading = false,
    slug,
    businessType,
    className,
}: JoinFormProps) {
    const wording = getBusinessWording(businessType)
    const [customerName, setCustomerName] = useState("")
    const [consent, setConsent] = useState(false)
    const [errors, setErrors] = useState<{ name?: string; consent?: string }>(
        {},
    )
    const [isCheckingName, setIsCheckingName] = useState(false)

    // Debounce name validation to prevent excessive API calls while user is typing
    useEffect(() => {
        const checkName = async () => {
            const trimmed = customerName.trim()
            if (trimmed.length < 2) return

            setIsCheckingName(true)
            const result = await checkNameAction(trimmed, slug)
            if (result.isBanned) {
                setErrors(prev => ({ ...prev, name: "Ce prénom n'est pas autorisé." }))
            } else {
                setErrors(prev => {
                    const next = { ...prev }
                    if (next.name === "Ce prénom n'est pas autorisé.") {
                        delete next.name
                    }
                    return next
                })
            }
            setIsCheckingName(false)
        }

        const timeoutId = setTimeout(checkName, 400)
        return () => clearTimeout(timeoutId)
    }, [customerName, slug])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const newErrors: { name?: string; consent?: string } = {}

        const trimmed = customerName.trim()
        if (trimmed.length < 2) {
            newErrors.name = "Le prénom doit contenir au moins 2 caractères."
        }
        if (trimmed.length > 50) {
            newErrors.name = "Le prénom ne peut pas dépasser 50 caractères."
        }
        if (!consent) {
            newErrors.consent =
                "Vous devez accepter les conditions pour continuer."
        }
        
        if (errors.name && errors.name === "Ce prénom n'est pas autorisé.") {
            newErrors.name = errors.name
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})
        onSubmit({ customerName: trimmed, consent })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-5", className)}
            noValidate
        >
            <Input
                label={`Prénom ou surnom du ${wording.singular}`}
                placeholder="Ex : Marie"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                error={errors.name}
                required
                autoComplete="given-name"
                maxLength={50}
            />

            <Checkbox
                label={`En rejoignant cette file, j'accepte que mon prénom soit utilisé pour m'appeler. Il sera supprimé automatiquement à la fin de la session.`}
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                error={errors.consent}
            />

            <Button
                type="submit"
                isLoading={isLoading || isCheckingName}
                disabled={isLoading || isCheckingName || !!errors.name}
                size="lg"
                className="w-full"
            >
                {wording.joinCta}
            </Button>
        </form>
    )
}

export { JoinForm, type JoinFormProps }
