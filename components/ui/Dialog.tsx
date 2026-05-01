"use client"

import { useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils/cn"
import { X } from "lucide-react"

type DialogProps = {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    className?: string
}

function Dialog({ open, onClose, children, className }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    const handleClose = useCallback(() => {
        onClose()
        previousFocusRef.current?.focus()
    }, [onClose])

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (open) {
            previousFocusRef.current = document.activeElement as HTMLElement
            dialog.showModal()
        } else {
            dialog.close()
        }
    }, [open])

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        const handleCancel = (e: Event) => {
            e.preventDefault()
            handleClose()
        }

        dialog.addEventListener("cancel", handleCancel)
        return () => dialog.removeEventListener("cancel", handleCancel)
    }, [handleClose])

    return (
        <dialog
            ref={dialogRef}
            className={cn(
                "m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border-default bg-surface-card p-0 shadow-xl",
                "backdrop:bg-surface-overlay",
                "open:animate-in open:fade-in-0 open:zoom-in-95",
                className,
            )}
            aria-modal="true"
        >
            {open ? children : null}
        </dialog>
    )
}

type DialogHeaderProps = {
    children: React.ReactNode
    onClose?: () => void
    className?: string
}

function DialogHeader({ children, onClose, className }: DialogHeaderProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between border-b border-border-default px-6 py-4",
                className,
            )}
        >
            <h2 className="text-lg font-bold text-text-primary">{children}</h2>
            {onClose ? (
                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-md p-1 text-text-secondary transition-colors hover:bg-border-default hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
                    aria-label="Fermer"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            ) : null}
        </div>
    )
}

type DialogContentProps = {
    children: React.ReactNode
    className?: string
}

function DialogContent({ children, className }: DialogContentProps) {
    return <div className={cn("px-6 py-4", className)}>{children}</div>
}

type DialogFooterProps = {
    children: React.ReactNode
    className?: string
}

function DialogFooter({ children, className }: DialogFooterProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-end gap-2 border-t border-border-default px-6 py-4",
                className,
            )}
        >
            {children}
        </div>
    )
}

export { Dialog, DialogHeader, DialogContent, DialogFooter, type DialogProps }
