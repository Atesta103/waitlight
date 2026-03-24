"use client"
import { useState } from "react"
import type { Meta } from "@storybook/react"
import { ConfirmDialog } from "@/components/composed/ConfirmDialog"
import { Button } from "@/components/ui/Button"

const meta = {
    title: "Composed/ConfirmDialog",
    component: ConfirmDialog,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof ConfirmDialog>

export default meta

function ConfirmDialogDemo({
    variant = "primary",
}: {
    variant?: "primary" | "destructive"
}) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button onClick={() => setOpen(true)} variant="secondary">
                Ouvrir le dialog
            </Button>
            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={() => { alert("Confirmé !"); setOpen(false) }}
                title={variant === "destructive" ? "Supprimer cet élément ?" : "Confirmer l'action ?"}
                description={
                    variant === "destructive"
                        ? "Cette action est irréversible. L'élément sera supprimé définitivement."
                        : "Voulez-vous vraiment effectuer cette action ?"
                }
                confirmLabel={variant === "destructive" ? "Supprimer" : "Confirmer"}
                variant={variant}
            />
        </>
    )
}

export const Primary = {
    render: () => <ConfirmDialogDemo variant="primary" />,
}

export const Destructive = {
    render: () => <ConfirmDialogDemo variant="destructive" />,
}
