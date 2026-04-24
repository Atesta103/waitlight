"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, AlertCircle, Send, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { CONTACT_SUBJECTS, ContactSchema, type ContactInput } from "@/lib/validators/contact"
import { sendContactMessageAction } from "@/lib/actions/contact"

type FieldError = Partial<Record<keyof ContactInput, string>>

function FieldWrapper({
    label,
    htmlFor,
    error,
    required,
    children,
}: {
    label: string
    htmlFor: string
    error?: string
    required?: boolean
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-sm font-semibold text-[#111827]">
                {label}
                {required && <span className="ml-1 text-[#6366F1]" aria-hidden="true">*</span>}
            </label>
            {children}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#EF4444]"
                        role="alert"
                    >
                        <AlertCircle size={12} aria-hidden="true" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

const INPUT_BASE =
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1]/25"
const INPUT_NORMAL = "border-[#D1D5DB] focus:border-[#6366F1]"
const INPUT_ERROR = "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/25"

/**
 * ContactForm — full client-side form with Zod validation and Server Action submission.
 * Shows inline field errors, a loading state, and a success confirmation.
 */
export function ContactForm() {
    const [fields, setFields] = useState<Omit<ContactInput, "consent">>({
        name: "",
        email: "",
        subject: "general",
        message: "",
    })
    const [consent, setConsent] = useState(false)
    const [errors, setErrors] = useState<FieldError>({})
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [serverError, setServerError] = useState<string | null>(null)
    const [charCount, setCharCount] = useState(0)

    const setField = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) => {
        setFields((prev) => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const input: ContactInput = { ...fields, consent: consent as true }
        const parsed = ContactSchema.safeParse(input)

        if (!parsed.success) {
            const fieldErrors: FieldError = {}
            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof ContactInput
                if (!fieldErrors[key]) fieldErrors[key] = issue.message
            }
            setErrors(fieldErrors)
            return
        }

        setStatus("loading")
        setServerError(null)

        const result = await sendContactMessageAction(parsed.data)

        if ("error" in result) {
            setStatus("error")
            setServerError(result.error)
            return
        }

        setStatus("success")
    }

    if (status === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="flex flex-col items-center text-center gap-6 py-12 px-6"
            >
                <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-[#16A34A]" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-[#111827]">Message envoyé !</h3>
                    <p className="mt-2 text-[#374151] text-sm leading-relaxed">
                        Merci pour votre message. Notre équipe vous répondra dès que possible à l&apos;adresse <strong>{fields.email}</strong>.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setStatus("idle")
                        setFields({ name: "", email: "", subject: "general", message: "" })
                        setConsent(false)
                        setCharCount(0)
                    }}
                    className="text-sm font-semibold text-[#6366F1] hover:underline"
                >
                    Envoyer un autre message
                </button>
            </motion.div>
        )
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Nom complet" htmlFor="contact-name" error={errors.name} required>
                    <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Jean Dupont"
                        value={fields.name}
                        onChange={(e) => setField("name", e.target.value)}
                        aria-invalid={!!errors.name}
                        className={cn(INPUT_BASE, errors.name ? INPUT_ERROR : INPUT_NORMAL)}
                    />
                </FieldWrapper>

                <FieldWrapper label="Adresse e-mail" htmlFor="contact-email" error={errors.email} required>
                    <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        placeholder="jean@example.com"
                        value={fields.email}
                        onChange={(e) => setField("email", e.target.value)}
                        aria-invalid={!!errors.email}
                        className={cn(INPUT_BASE, errors.email ? INPUT_ERROR : INPUT_NORMAL)}
                    />
                </FieldWrapper>
            </div>

            {/* Subject select */}
            <FieldWrapper label="Sujet" htmlFor="contact-subject" error={errors.subject} required>
                <div className="relative">
                    <select
                        id="contact-subject"
                        value={fields.subject}
                        onChange={(e) => setField("subject", e.target.value as ContactInput["subject"])}
                        aria-invalid={!!errors.subject}
                        className={cn(
                            INPUT_BASE,
                            "appearance-none cursor-pointer pr-10",
                            errors.subject ? INPUT_ERROR : INPUT_NORMAL,
                        )}
                    >
                        {CONTACT_SUBJECTS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                        aria-hidden="true"
                    />
                </div>
            </FieldWrapper>

            {/* Message textarea */}
            <FieldWrapper label="Message" htmlFor="contact-message" error={errors.message} required>
                <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Décrivez votre demande, problème ou suggestion…"
                    value={fields.message}
                    onChange={(e) => {
                        setField("message", e.target.value)
                        setCharCount(e.target.value.length)
                    }}
                    aria-invalid={!!errors.message}
                    className={cn(
                        INPUT_BASE,
                        "resize-none leading-relaxed",
                        errors.message ? INPUT_ERROR : INPUT_NORMAL,
                    )}
                />
                <p className={cn("text-right text-xs", charCount > 1900 ? "text-[#EF4444]" : "text-[#9CA3AF]")}>
                    {charCount} / 2000
                </p>
            </FieldWrapper>

            {/* Consent */}
            <div className="flex flex-col gap-1.5">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                        <input
                            id="contact-consent"
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => {
                                setConsent(e.target.checked)
                                if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }))
                            }}
                            className="sr-only"
                            aria-invalid={!!errors.consent}
                        />
                        <div
                            className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                consent
                                    ? "border-[#6366F1] bg-[#6366F1]"
                                    : errors.consent
                                      ? "border-[#EF4444]"
                                      : "border-[#D1D5DB] group-hover:border-[#6366F1]",
                            )}
                        >
                            {consent && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-sm text-[#374151] leading-snug">
                        J&apos;accepte que mes informations soient utilisées pour traiter ma demande conformément à la{" "}
                        <a href="/legal/privacy" className="text-[#6366F1] hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                            politique de confidentialité
                        </a>.
                    </span>
                </label>
                <AnimatePresence>
                    {errors.consent && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#EF4444]"
                            role="alert"
                        >
                            <AlertCircle size={12} aria-hidden="true" />
                            {errors.consent}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* Server error banner */}
            <AnimatePresence>
                {status === "error" && serverError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-3 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] px-4 py-3"
                        role="alert"
                    >
                        <AlertCircle size={16} className="text-[#EF4444] flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-sm text-[#DC2626]">{serverError}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit */}
            <button
                type="submit"
                disabled={status === "loading"}
                className={cn(
                    "inline-flex items-center justify-center gap-2",
                    "w-full sm:w-auto sm:self-end",
                    "px-6 py-2.5 rounded-xl",
                    "bg-[#6366F1] text-white text-sm font-semibold",
                    "shadow-[0_0_16px_rgba(99,102,241,0.3)]",
                    "hover:bg-[#4F46E5] hover:shadow-[0_0_28px_rgba(99,102,241,0.45)]",
                    "transition-all duration-200",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
            >
                {status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                    <Send size={16} aria-hidden="true" />
                )}
                {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
            </button>
        </form>
    )
}
