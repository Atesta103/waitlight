"use client"

import { useState } from "react"
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogFooter,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { getBusinessWording } from "@/lib/utils/business-wording"
import { CreateManualTicketSchema } from "@/lib/validators/queue"

type ManualTicketDialogProps = {
    businessType?: string | null
    onCreate: (
        customerName: string,
    ) => Promise<{ data?: unknown; error?: string }>
    isSubmitting?: boolean
    className?: string
}

function ManualTicketDialog({
    businessType,
    onCreate,
    isSubmitting = false,
    className,
}: ManualTicketDialogProps) {
    const wording = getBusinessWording(businessType)
    const [open, setOpen] = useState(false)
    const [customerName, setCustomerName] = useState("")
    const [error, setError] = useState<string | null>(null)

    const resetForm = () => {
        setCustomerName("")
        setError(null)
    }

    const handleClose = () => {
        setOpen(false)
        resetForm()
    }

    const handleSubmit = async () => {
        const parsed = CreateManualTicketSchema.safeParse({ customerName })
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Données invalides.")
            return
        }

        setError(null)
        const result = await onCreate(parsed.data.customerName)
        if (result?.error) {
            setError(result.error)
            return
        }

        handleClose()
    }

    return (
        <div className={className}>
            <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
                Ajouter un {wording.singular}
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogHeader onClose={handleClose}>Ajout manuel</DialogHeader>
                <DialogContent>
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-text-secondary">
                            Ajoutez un {wording.singular} sans QR code.
                        </p>
                        <Input
                            label={`Prénom du ${wording.singular}`}
                            placeholder="Ex : Marie"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            error={error ?? undefined}
                            maxLength={50}
                            autoComplete="given-name"
                        />
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                    >
                        Ajouter
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export { ManualTicketDialog, type ManualTicketDialogProps }
