"use client"

import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogFooter,
} from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"

type ConfirmDialogProps = {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "destructive" | "primary"
    isLoading?: boolean
}

function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    variant = "primary",
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogHeader onClose={onClose}>{title}</DialogHeader>
            <DialogContent>
                <p className="text-sm text-text-secondary">{description}</p>
            </DialogContent>
            <DialogFooter>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant={
                        variant === "destructive" ? "destructive" : "primary"
                    }
                    size="sm"
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmLabel}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export { ConfirmDialog, type ConfirmDialogProps }
