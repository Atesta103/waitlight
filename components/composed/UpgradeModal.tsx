"use client"

import { useRouter } from "next/navigation"
import { Sparkles, Lock } from "lucide-react"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/Dialog"

type UpgradeModalProps = {
    open: boolean
    onClose: () => void
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
    const router = useRouter()

    function handleUpgrade() {
        onClose()
        router.push("/subscribe")
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogHeader onClose={onClose}>
                <span className="flex items-center gap-2">
                    <Lock size={18} className="text-brand-primary" aria-hidden="true" />
                    Fonctionnalité Pro
                </span>
            </DialogHeader>
            <DialogContent>
                <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <p className="font-semibold text-text-primary">
                            Ouvrez votre file d&apos;attente avec WaitLight Pro
                        </p>
                        <p className="text-sm text-text-secondary">
                            Vous pouvez explorer et personnaliser votre espace librement.
                            Pour activer et partager votre file d&apos;attente à vos clients, passez à l&apos;offre Pro.
                        </p>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                        {[
                            "File d'attente en temps réel",
                            "QR code et lien de partage",
                            "Personnalisation complète",
                            "Analytiques & historique",
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </DialogContent>
            <DialogFooter>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                    Plus tard
                </button>
                <button
                    type="button"
                    onClick={handleUpgrade}
                    className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-[var(--color-text-on-primary)] shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                    <Sparkles size={14} aria-hidden="true" />
                    Voir les offres
                </button>
            </DialogFooter>
        </Dialog>
    )
}
