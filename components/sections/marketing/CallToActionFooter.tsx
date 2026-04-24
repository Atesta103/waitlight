import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getButtonClasses } from "@/components/ui/button-classes"
import { cn } from "@/lib/utils/cn"

type CallToActionFooterProps = {
    id: string
}

export function CallToActionFooter({ id }: CallToActionFooterProps) {
    return (
        <section id={id} className="border-t border-border-default bg-surface-base">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="rounded-3xl border border-border-default bg-gradient-to-br from-feedback-success-bg to-surface-card p-6 sm:p-10">
                    <h2 className="text-3xl font-bold leading-tight text-text-primary sm:text-4xl font-[var(--font-poppins)]">
                        Faites vivre une meilleure attente à vos clients
                    </h2>
                    <p className="mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
                        Donnez une image moderne à votre accueil et fluidifiez vos heures de rush,
                        sans complexité pour votre équipe.
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className={cn(getButtonClasses({ size: "lg" }), "w-full sm:w-auto")}
                        >
                            Créer mon compte marchand
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                        <Link
                            href="/login"
                            className={cn(
                                getButtonClasses({ variant: "secondary", size: "lg" }),
                                "w-full sm:w-auto border border-border-default",
                            )}
                        >
                            Se connecter
                        </Link>
                    </div>
                </div>

                <footer className="mt-8 flex flex-col gap-2 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Wait-Light</p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/register" className="transition-colors hover:text-text-primary">
                            Démarrer
                        </Link>
                        <Link href="/login" className="transition-colors hover:text-text-primary">
                            Connexion
                        </Link>
                        <Link href="/contact" className="transition-colors hover:text-text-primary">
                            Contact
                        </Link>
                    </div>
                </footer>
            </div>
        </section>
    )
}
