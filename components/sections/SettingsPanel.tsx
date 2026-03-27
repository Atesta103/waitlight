"use client"

import { useState, useTransition, useRef, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/Card"
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogFooter,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"
import { SlugInput } from "@/components/composed/SlugInput"
import { cn } from "@/lib/utils/cn"
import { duration, ease } from "@/lib/utils/motion"
import {
    Save,
    Bell,
    User,
    Clock,
    Upload,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    ImagePlus,
    BellRing,
    Layers,
    Zap,
    Info,
    Sparkles,
    RotateCcw,
} from "lucide-react"
import {
    updateMerchantIdentityAction,
    updateQueueSettingsAction,
    checkSlugAvailabilitySettingsAction,
    deleteLogoAction,
    resetAvgPrepTimeAction,
} from "@/lib/actions/settings"
import { createClient } from "@/lib/supabase/client"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SettingsData = {
    merchantName: string
    slug: string
    logoUrl: string | null
    defaultPrepTimeMin: number
    maxCapacity: number
    welcomeMessage: string
    notificationsEnabled: boolean
    autoCloseEnabled: boolean
    /** Auto-computed value from calculate_avg_prep(). null = manual mode. */
    calculatedAvgPrepTime: number | null
    /** ISO timestamp of the last cron run. null = never run yet. */
    avgPrepComputedAt: string | null
}

type SettingsPanelProps = {
    initialData: SettingsData
    className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav sections definition
// ─────────────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
    { id: "identity", label: "Identité", icon: User },
    { id: "queue", label: "File d'attente", icon: Layers },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "waittime", label: "Temps d'attente", icon: Clock },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// SectionBlock — section with anchor + visual accent
// ─────────────────────────────────────────────────────────────────────────────

function SectionBlock({
    id,
    icon: Icon,
    title,
    description,
    children,
    badge,
}: {
    id: string
    icon: React.ElementType
    title: string
    description?: string
    children: React.ReactNode
    badge?: React.ReactNode
}) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className="scroll-mt-24"
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-default bg-surface-card text-text-secondary shadow-sm">
                        <Icon size={17} aria-hidden="true" />
                    </span>
                    <div>
                        <h2
                            id={`${id}-heading`}
                            className="text-base font-semibold text-text-primary"
                        >
                            {title}
                        </h2>
                        {description ? (
                            <p className="text-xs text-text-secondary">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>
                {badge ?? null}
            </div>
            {children}
        </section>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ToggleRow — rich toggle with icon + description
// ─────────────────────────────────────────────────────────────────────────────

function ToggleRow({
    icon: Icon,
    label,
    description,
    checked,
    onChange,
}: {
    icon: React.ElementType
    label: string
    description: string
    checked: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <div
            className={cn(
                "flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors",
                checked
                    ? "border-brand-primary/30 bg-brand-primary/5"
                    : "border-border-default bg-surface-base",
            )}
        >
            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        checked
                            ? "bg-brand-primary/15 text-brand-primary"
                            : "bg-border-default/50 text-text-secondary",
                    )}
                    aria-hidden="true"
                >
                    <Icon size={15} />
                </span>
                <div>
                    <p className="text-sm font-medium text-text-primary">
                        {label}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                        {description}
                    </p>
                </div>
            </div>
            <Toggle
                checked={checked}
                onChange={onChange}
                label={label}
                className="shrink-0 [&>span]:hidden"
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow — read-only info line
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0">
            <span className="text-text-secondary">{label}</span>
            <span className="font-medium text-text-primary">{value}</span>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedSaveBar — slides up / down with AnimatePresence
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedSaveBar({
    show,
    onSave,
    onCancel,
    isLoading,
    label,
    error,
    success,
    successMessage,
}: {
    show: boolean
    onSave: () => void
    onCancel: () => void
    isLoading: boolean
    label: string
    error: string | null
    success: boolean
    successMessage: string
}) {
    const shouldReduce = useReducedMotion()
    const transition = shouldReduce
        ? { duration: 0 }
        : { duration: duration.default, ease: ease.default }

    return (
        <AnimatePresence>
            {show || error || success ? (
                <motion.div
                    key="savebar"
                    initial={shouldReduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={transition}
                    className="mt-3 overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-sm"
                >
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-3">
                            {show ? (
                                <>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={onSave}
                                        isLoading={isLoading}
                                    >
                                        <Save size={14} aria-hidden="true" />
                                        {label}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onCancel}
                                        disabled={isLoading}
                                    >
                                        Annuler
                                    </Button>
                                </>
                            ) : null}
                        </div>

                        <div aria-live="polite" aria-atomic="true">
                            {error ? (
                                <p
                                    role="alert"
                                    className="text-sm text-feedback-error"
                                >
                                    {error}
                                </p>
                            ) : success && !show ? (
                                <p className="flex items-center gap-1.5 text-sm text-feedback-success">
                                    <CheckCircle2
                                        size={14}
                                        aria-hidden="true"
                                    />
                                    {successMessage}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// UploadZone — large drag-and-drop logo area
// ─────────────────────────────────────────────────────────────────────────────

function UploadZone({
    name,
    logoUrl,
    logoPreview,
    isUploading,
    uploadError,
    onFile,
    onDelete,
    fileInputRef,
}: {
    name: string
    logoUrl: string | null
    logoPreview: string | null
    isUploading: boolean
    uploadError: string | null
    onFile: (e: React.ChangeEvent<HTMLInputElement>) => void
    onDelete: () => void
    fileInputRef: React.RefObject<HTMLInputElement | null>
}) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (!file) return
            // Reuse the input's onChange by creating a synthetic event-like call
            const dt = new DataTransfer()
            dt.items.add(file)
            const input = fileInputRef.current
            if (input) {
                Object.defineProperty(input, "files", {
                    value: dt.files,
                    writable: true,
                })
                input.dispatchEvent(new Event("change", { bubbles: true }))
            }
        },
        [fileInputRef],
    )

    const currentImage = logoPreview ?? logoUrl
    const hasImage = Boolean(currentImage)

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Drop target */}
            <div
                role="button"
                tabIndex={0}
                aria-label="Zone de dépôt du logo"
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        fileInputRef.current?.click()
                    }
                }}
                className={cn(
                    "group relative flex h-28 w-28 shrink-0 cursor-pointer flex-col items-center justify-center",
                    "rounded-2xl border-2 border-dashed transition-all",
                    "focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
                    isDragging
                        ? "scale-105 border-brand-primary bg-brand-primary/8"
                        : hasImage
                          ? "border-border-default hover:border-brand-primary/50"
                          : "border-border-default bg-surface-base hover:border-brand-primary/50 hover:bg-surface-card",
                )}
            >
                {hasImage ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={currentImage!}
                            alt={name}
                            className="h-full w-full rounded-2xl object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <ImagePlus
                                size={22}
                                className="text-white"
                                aria-hidden="true"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1.5 text-text-secondary">
                        <Upload size={22} aria-hidden="true" />
                        <span className="text-center text-xs font-medium leading-tight">
                            Cliquer ou
                            <br />
                            glisser
                        </span>
                    </div>
                )}
                {isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-surface-card/70">
                        <svg
                            className="h-6 w-6 animate-spin text-brand-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                            />
                        </svg>
                    </div>
                ) : null}
            </div>

            {/* Metadata + actions */}
            <div className="flex flex-col gap-2 pt-1">
                <p className="text-sm font-medium text-text-primary">
                    Logo du commerce
                </p>
                <p className="text-xs text-text-secondary">
                    JPG, PNG ou WebP · max 512 Ko · 1 : 1 recommandé
                </p>
                {uploadError ? (
                    <p className="text-xs text-feedback-error">{uploadError}</p>
                ) : null}
                <div className="flex items-center gap-2 pt-1">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <Upload size={13} aria-hidden="true" />
                        {hasImage ? "Changer" : "Importer"}
                    </Button>
                    {logoUrl ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            disabled={isUploading}
                            className="text-feedback-error hover:bg-feedback-error/10"
                            aria-label="Supprimer le logo"
                        >
                            <Trash2 size={13} aria-hidden="true" />
                            Supprimer
                        </Button>
                    ) : null}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Choisir un logo"
                onChange={onFile}
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// UnchangedBadge
// ─────────────────────────────────────────────────────────────────────────────

function ChangedBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/12 px-2 py-0.5 text-xs font-medium text-brand-primary">
            <span
                className="h-1.5 w-1.5 rounded-full bg-brand-primary"
                aria-hidden="true"
            />
            Modifié
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

function SettingsPanel({ initialData, className }: SettingsPanelProps) {
    const shouldReduce = useReducedMotion()

    // ── Identity ──────────────────────────────────────────────────────────────
    const [identity, setIdentity] = useState({
        merchantName: initialData.merchantName,
        slug: initialData.slug,
        logoUrl: initialData.logoUrl,
        defaultPrepTimeMin: initialData.defaultPrepTimeMin,
    })
    const [identityChanged, setIdentityChanged] = useState(false)
    const [identityError, setIdentityError] = useState<string | null>(null)
    const [identitySuccess, setIdentitySuccess] = useState(false)
    const [isIdentityPending, startIdentityTransition] = useTransition()

    // ── Queue ─────────────────────────────────────────────────────────────────
    const [queue, setQueue] = useState({
        maxCapacity: initialData.maxCapacity,
        welcomeMessage: initialData.welcomeMessage,
        notificationsEnabled: initialData.notificationsEnabled,
        autoCloseEnabled: initialData.autoCloseEnabled,
    })
    const [queueChanged, setQueueChanged] = useState(false)
    const [queueError, setQueueError] = useState<string | null>(null)
    const [queueSuccess, setQueueSuccess] = useState(false)
    const [isQueuePending, startQueueTransition] = useTransition()

    // ── Logo ──────────────────────────────────────────────────────────────────
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Logo delete dialog ────────────────────────────────────────────────────
    const [showDeleteLogoDialog, setShowDeleteLogoDialog] = useState(false)
    const [isDeleteLogoPending, startDeleteLogoTransition] = useTransition()
    const [deleteLogoError, setDeleteLogoError] = useState<string | null>(null)

    // ── Auto prep time reset ───────────────────────────────────────────────────
    const [showResetPrepDialog, setShowResetPrepDialog] = useState(false)
    const [isResetPrepPending, startResetPrepTransition] = useTransition()
    const [resetPrepError, setResetPrepError] = useState<string | null>(null)
    const [calcPrepTime, setCalcPrepTime] = useState<number | null>(
        initialData.calculatedAvgPrepTime,
    )
    const [prepComputedAt, setPrepComputedAt] = useState<string | null>(
        initialData.avgPrepComputedAt,
    )

    const handleConfirmResetPrep = () => {
        startResetPrepTransition(async () => {
            const result = await resetAvgPrepTimeAction()
            if ("error" in result) {
                setResetPrepError(result.error)
            } else {
                setCalcPrepTime(null)
                setPrepComputedAt(null)
                setShowResetPrepDialog(false)
                setResetPrepError(null)
            }
        })
    }

    // ── Slug confirm dialog ───────────────────────────────────────────────────
    const [showSlugConfirmDialog, setShowSlugConfirmDialog] = useState(false)

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    const updateIdentity = <K extends keyof typeof identity>(
        key: K,
        value: (typeof identity)[K],
    ) => {
        setIdentity((prev) => ({ ...prev, [key]: value }))
        setIdentityChanged(true)
        setIdentityError(null)
        setIdentitySuccess(false)
    }

    const updateQueue = <K extends keyof typeof queue>(
        key: K,
        value: (typeof queue)[K],
    ) => {
        setQueue((prev) => ({ ...prev, [key]: value }))
        setQueueChanged(true)
        setQueueError(null)
        setQueueSuccess(false)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Logo upload
    // ─────────────────────────────────────────────────────────────────────────

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            setUploadError("Format non supporté. Utilisez JPG, PNG ou WebP.")
            return
        }
        if (file.size > 524288) {
            setUploadError("Fichier trop grand. Maximum 512 Ko.")
            return
        }

        setUploadError(null)
        const reader = new FileReader()
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
        setIsUploading(true)

        const supabase = createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            setUploadError("Session expirée.")
            setLogoPreview(null)
            setIsUploading(false)
            return
        }

        const ext = file.name.split(".").pop() ?? "jpg"
        const path = `${user.id}/logo.${ext}`

        const { error: storageError } = await supabase.storage
            .from("merchant-logos")
            .upload(path, file, { upsert: true, contentType: file.type })

        if (storageError) {
            setUploadError("Erreur lors de l'upload. Veuillez réessayer.")
            setLogoPreview(null)
            setIsUploading(false)
            return
        }

        const { data: urlData } = supabase.storage
            .from("merchant-logos")
            .getPublicUrl(path)

        setLogoPreview(null)
        updateIdentity("logoUrl", urlData.publicUrl)
        setIsUploading(false)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Logo delete
    // ─────────────────────────────────────────────────────────────────────────

    const handleConfirmDeleteLogo = () => {
        startDeleteLogoTransition(async () => {
            const result = await deleteLogoAction()
            if ("error" in result) {
                setDeleteLogoError(result.error)
            } else {
                updateIdentity("logoUrl", null)
                setLogoPreview(null)
                setShowDeleteLogoDialog(false)
                setDeleteLogoError(null)
            }
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Save handlers
    // ─────────────────────────────────────────────────────────────────────────

    const doSaveIdentity = () => {
        startIdentityTransition(async () => {
            const result = await updateMerchantIdentityAction({
                name: identity.merchantName,
                slug: identity.slug,
                logo_url: identity.logoUrl ?? undefined,
                default_prep_time_min: identity.defaultPrepTimeMin,
            })
            if ("error" in result) {
                setIdentityError(result.error)
            } else {
                setIdentityChanged(false)
                setIdentitySuccess(true)
            }
        })
    }

    const handleSaveIdentity = () => {
        if (identity.slug !== initialData.slug) {
            setShowSlugConfirmDialog(true)
        } else {
            doSaveIdentity()
        }
    }

    const handleResetIdentity = () => {
        setIdentity({
            merchantName: initialData.merchantName,
            slug: initialData.slug,
            logoUrl: initialData.logoUrl,
            defaultPrepTimeMin: initialData.defaultPrepTimeMin,
        })
        setIdentityChanged(false)
        setIdentityError(null)
        setIdentitySuccess(false)
    }

    const handleSaveQueue = () => {
        startQueueTransition(async () => {
            const result = await updateQueueSettingsAction({
                max_capacity: queue.maxCapacity,
                welcome_message: queue.welcomeMessage || null,
                notifications_enabled: queue.notificationsEnabled,
                auto_close_enabled: queue.autoCloseEnabled,
            })
            if ("error" in result) {
                setQueueError(result.error)
            } else {
                setQueueChanged(false)
                setQueueSuccess(true)
            }
        })
    }

    const handleResetQueue = () => {
        setQueue({
            maxCapacity: initialData.maxCapacity,
            welcomeMessage: initialData.welcomeMessage,
            notificationsEnabled: initialData.notificationsEnabled,
            autoCloseEnabled: initialData.autoCloseEnabled,
        })
        setQueueChanged(false)
        setQueueError(null)
        setQueueSuccess(false)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Section reveal animation
    // ─────────────────────────────────────────────────────────────────────────

    const sectionVariants = {
        hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: shouldReduce ? 0 : i * 0.07,
                duration: duration.default,
                ease: ease.default,
            },
        }),
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={cn("flex gap-10", className)}>
            {/* ── Sticky sidebar nav (desktop only) ────────────────────── */}
            <nav
                aria-label="Navigation des paramètres"
                className="sticky top-24 hidden h-fit w-44 shrink-0 lg:block"
            >
                <ul className="flex flex-col gap-1">
                    {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className={cn(
                                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary",
                                    "transition-colors hover:bg-surface-card hover:text-text-primary",
                                    "focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
                                )}
                            >
                                <Icon size={15} aria-hidden="true" />
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="min-w-0 flex-1">
                <div className="flex max-w-2xl flex-col gap-10">
                    {/* ── Identity ──────────────────────────────────────── */}
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={sectionVariants}
                    >
                        <SectionBlock
                            id="identity"
                            icon={User}
                            title="Identité du commerce"
                            description="Nom, logo et URL publique de votre page d'attente."
                            badge={
                                identityChanged ? <ChangedBadge /> : undefined
                            }
                        >
                            <Card>
                                <CardContent>
                                    <div className="flex flex-col gap-6 pt-1">
                                        {/* Upload zone */}
                                        <UploadZone
                                            name={identity.merchantName}
                                            logoUrl={identity.logoUrl}
                                            logoPreview={logoPreview}
                                            isUploading={isUploading}
                                            uploadError={uploadError}
                                            onFile={handleLogoChange}
                                            onDelete={() =>
                                                setShowDeleteLogoDialog(true)
                                            }
                                            fileInputRef={fileInputRef}
                                        />

                                        <hr className="border-border-default" />

                                        {/* Name + prep time */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Input
                                                label="Nom du commerce"
                                                value={identity.merchantName}
                                                onChange={(e) =>
                                                    updateIdentity(
                                                        "merchantName",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Input
                                                label="Temps de préparation (min)"
                                                type="number"
                                                min={1}
                                                max={120}
                                                value={
                                                    identity.defaultPrepTimeMin
                                                }
                                                onChange={(e) =>
                                                    updateIdentity(
                                                        "defaultPrepTimeMin",
                                                        Number(e.target.value),
                                                    )
                                                }
                                                hint="Durée par défaut par client."
                                            />
                                        </div>

                                        {/* Slug */}
                                        <SlugInput
                                            value={identity.slug}
                                            onChange={(v) =>
                                                updateIdentity("slug", v)
                                            }
                                            checkAvailability={
                                                checkSlugAvailabilitySettingsAction
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <AnimatedSaveBar
                                show={identityChanged}
                                onSave={handleSaveIdentity}
                                onCancel={handleResetIdentity}
                                isLoading={isIdentityPending}
                                label="Enregistrer l'identité"
                                error={identityError}
                                success={identitySuccess}
                                successMessage="Identité mise à jour."
                            />
                        </SectionBlock>
                    </motion.div>

                    {/* ── Queue config ───────────────────────────────────── */}
                    <motion.div
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={sectionVariants}
                    >
                        <SectionBlock
                            id="queue"
                            icon={Layers}
                            title="Configuration de la file"
                            description="Capacité maximale et message affiché lors du scan."
                            badge={queueChanged ? <ChangedBadge /> : undefined}
                        >
                            <Card>
                                <CardContent>
                                    <div className="flex flex-col gap-5 pt-1">
                                        <Input
                                            label="Capacité maximale"
                                            type="number"
                                            min={1}
                                            max={500}
                                            value={queue.maxCapacity}
                                            onChange={(e) =>
                                                updateQueue(
                                                    "maxCapacity",
                                                    Number(e.target.value),
                                                )
                                            }
                                            hint="Au-delà, les nouveaux clients ne peuvent plus rejoindre."
                                        />
                                        <Textarea
                                            label="Message d'accueil"
                                            value={queue.welcomeMessage}
                                            onChange={(e) =>
                                                updateQueue(
                                                    "welcomeMessage",
                                                    e.target.value,
                                                )
                                            }
                                            hint="Affiché sur la page client après le scan du QR code."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notifications & automations — visually grouped */}
                            <div
                                id="notifications"
                                className="mt-4 flex flex-col gap-3 scroll-mt-6"
                                aria-label="Notifications et automatisations"
                            >
                                <div className="flex items-center gap-2 pl-1">
                                    <Bell
                                        size={14}
                                        className="text-text-secondary"
                                        aria-hidden="true"
                                    />
                                    <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Notifications &amp; automatisations
                                    </p>
                                </div>
                                <ToggleRow
                                    icon={BellRing}
                                    label="Notifications push clients"
                                    description="Envoie une notification au client lorsqu'il est appelé."
                                    checked={queue.notificationsEnabled}
                                    onChange={(v) =>
                                        updateQueue("notificationsEnabled", v)
                                    }
                                />
                                <ToggleRow
                                    icon={Zap}
                                    label="Fermeture automatique"
                                    description="Passe le ticket en « terminé » si aucune action dans les 5 min après l'appel."
                                    checked={queue.autoCloseEnabled}
                                    onChange={(v) =>
                                        updateQueue("autoCloseEnabled", v)
                                    }
                                />
                            </div>

                            <AnimatedSaveBar
                                show={queueChanged}
                                onSave={handleSaveQueue}
                                onCancel={handleResetQueue}
                                isLoading={isQueuePending}
                                label="Enregistrer"
                                error={queueError}
                                success={queueSuccess}
                                successMessage="Configuration mise à jour."
                            />
                        </SectionBlock>
                    </motion.div>

                    {/* ── Wait time (live) ───────────────────────────────── */}
                    <motion.div
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={sectionVariants}
                    >
                        <SectionBlock
                            id="waittime"
                            icon={Clock}
                            title="Temps d'attente estimé"
                            description="L'algorithme ajuste le temps affiché aux clients en fonction de vos données réelles."
                            badge={
                                calcPrepTime !== null ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-feedback-success/12 px-2.5 py-0.5 text-xs font-medium text-feedback-success">
                                        <Sparkles
                                            size={11}
                                            aria-hidden="true"
                                        />
                                        Ajusté auto
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-border-default/60 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                                        Temps manuel
                                    </span>
                                )
                            }
                        >
                            <Card>
                                <CardContent>
                                    <div className="flex flex-col divide-y divide-border-default pt-1">
                                        {/* Effective time */}
                                        <InfoRow
                                            label="Temps effectif affiché"
                                            value={
                                                <span className="font-semibold text-text-primary">
                                                    {calcPrepTime ??
                                                        identity.defaultPrepTimeMin}{" "}
                                                    min
                                                </span>
                                            }
                                        />
                                        <InfoRow
                                            label="Valeur par défaut"
                                            value={`${identity.defaultPrepTimeMin} min (configurée manuellement)`}
                                        />
                                        {prepComputedAt ? (
                                            <InfoRow
                                                label="Dernière mise à jour"
                                                value={
                                                    new Date(
                                                        prepComputedAt,
                                                    ).toLocaleTimeString(
                                                        "fr-FR",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )
                                                }
                                            />
                                        ) : null}
                                    </div>

                                    {/* Explainability note */}
                                    <div className="mt-4 flex gap-2.5 rounded-lg border border-border-default bg-surface-base p-3">
                                        <Info
                                            size={15}
                                            className="mt-0.5 shrink-0 text-text-secondary"
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm text-text-secondary">
                                            L&apos;algorithme analyse vos 50
                                            derniers tickets complétés, retire
                                            les valeurs aberrantes (filtre IQR)
                                            et lisse les changements progressivement
                                            (EMA α=0,3). Il se déclenche toutes
                                            les 30 min quand la file est ouverte.
                                            Au moins 5 tickets valides sont
                                            requis avant activation.
                                        </p>
                                    </div>

                                    {/* Reset button */}
                                    {calcPrepTime !== null && (
                                        <div className="mt-4 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setShowResetPrepDialog(
                                                        true,
                                                    )
                                                }
                                                className="text-text-secondary"
                                            >
                                                <RotateCcw
                                                    size={13}
                                                    aria-hidden="true"
                                                />
                                                Réinitialiser
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </SectionBlock>
                    </motion.div>
                </div>
            </div>

            {/* ── Delete logo confirmation ──────────────────────────────── */}
            <Dialog
                open={showDeleteLogoDialog}
                onClose={() => setShowDeleteLogoDialog(false)}
            >
                <DialogHeader onClose={() => setShowDeleteLogoDialog(false)}>
                    Supprimer le logo
                </DialogHeader>
                <DialogContent>
                    <p className="text-sm text-text-secondary">
                        Cette action supprimera définitivement le logo du
                        commerce. Êtes-vous sûr ?
                    </p>
                    {deleteLogoError ? (
                        <p
                            role="alert"
                            className="mt-2 text-sm text-feedback-error"
                        >
                            {deleteLogoError}
                        </p>
                    ) : null}
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setShowDeleteLogoDialog(false)}
                        disabled={isDeleteLogoPending}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmDeleteLogo}
                        isLoading={isDeleteLogoPending}
                    >
                        Supprimer
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* ── Reset auto prep time confirmation ───────────────────── */}
            <Dialog
                open={showResetPrepDialog}
                onClose={() => setShowResetPrepDialog(false)}
            >
                <DialogHeader
                    onClose={() => setShowResetPrepDialog(false)}
                >
                    Réinitialiser le temps automatique
                </DialogHeader>
                <DialogContent>
                    <div className="flex gap-3">
                        <RotateCcw
                            size={20}
                            className="mt-0.5 shrink-0 text-text-secondary"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-sm font-medium text-text-primary">
                                Retour au mode manuel
                            </p>
                            <p className="mt-1 text-sm text-text-secondary">
                                Le temps automatique ({calcPrepTime} min) sera
                                effacé et remplacé par votre valeur par défaut
                                ({identity.defaultPrepTimeMin} min). L
                                &apos;algorithme se réactivera après
                                l&apos;accumulation de nouveaux tickets.
                            </p>
                        </div>
                    </div>
                    {resetPrepError ? (
                        <p
                            role="alert"
                            className="mt-2 text-sm text-feedback-error"
                        >
                            {resetPrepError}
                        </p>
                    ) : null}
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setShowResetPrepDialog(false)}
                        disabled={isResetPrepPending}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirmResetPrep}
                        isLoading={isResetPrepPending}
                    >
                        Confirmer
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* ── Slug change confirmation ──────────────────────────────── */}
            <Dialog
                open={showSlugConfirmDialog}
                onClose={() => setShowSlugConfirmDialog(false)}
            >
                <DialogHeader onClose={() => setShowSlugConfirmDialog(false)}>
                    Changer le slug
                </DialogHeader>
                <DialogContent>
                    <div className="flex gap-3">
                        <AlertTriangle
                            size={20}
                            className="shrink-0 text-yellow-500"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-sm font-medium text-text-primary">
                                Les QR codes déjà imprimés ne fonctionneront
                                plus.
                            </p>
                            <p className="mt-1 text-sm text-text-secondary">
                                Ancien :{" "}
                                <code className="font-mono">
                                    {initialData.slug}
                                </code>
                                <br />
                                Nouveau :{" "}
                                <code className="font-mono">
                                    {identity.slug}
                                </code>
                            </p>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setShowSlugConfirmDialog(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowSlugConfirmDialog(false)
                            doSaveIdentity()
                        }}
                    >
                        Confirmer le changement
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export { SettingsPanel, type SettingsPanelProps, type SettingsData }
