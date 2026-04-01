"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { useState } from "react"

const meta = {
    title: "UI/Dialog",
    component: Dialog,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Dialog>

export default meta
type StoryRender = StoryObj

function DialogDemo({
    title,
    description,
    destructive = false,
}: {
    title: string
    description: string
    destructive?: boolean
}) {
    const [open, setOpen] = useState(false)
    return (
        <div className="flex h-screen items-center justify-center bg-surface-base">
            <Button onClick={() => setOpen(true)}>Ouvrir le dialog</Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogHeader onClose={() => setOpen(false)}>{title}</DialogHeader>
                <DialogContent>
                    <p className="text-sm text-text-secondary">{description}</p>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant={destructive ? "destructive" : "primary"}
                        onClick={() => setOpen(false)}
                    >
                        {destructive ? "Supprimer" : "Confirmer"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export const Default: StoryRender = {
    render: () => (
        <DialogDemo
            title="Confirmer l'action"
            description="Êtes-vous sûr-e de vouloir effectuer cette action ? Cette action est irréversible."
        />
    ),
}

export const Destructive: StoryRender = {
    render: () => (
        <DialogDemo
            title="Supprimer le compte"
            description="Cette action supprimera définitivement votre compte et toutes vos données. Cette action est irréversible."
            destructive
        />
    ),
}

export const SlugChange: StoryRender = {
    render: () => (
        <DialogDemo
            title="Changer le slug"
            description="Changer votre slug invalidera tous les QR codes actuellement imprimés. Êtes-vous sûr-e ?"
        />
    ),
}
