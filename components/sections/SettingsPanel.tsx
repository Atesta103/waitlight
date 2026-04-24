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
import { ColorPicker } from "@/components/ui/ColorPicker"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher"
import { SlugInput } from "@/components/composed/SlugInput"
import { cn } from "@/lib/utils/cn"
import { duration, ease } from "@/lib/utils/motion"
import {
    Bell,
    User,
    Clock,
    Upload,
    Trash2,
    AlertTriangle,
    ImagePlus,
    BellRing,
    Layers,
    Zap,
    Info,
    Sparkles,
    RotateCcw,
    ShieldAlert,
    CalendarClock,
} from "lucide-react"
import {
    updateMerchantIdentityAction,
    updateQueueSettingsAction,
    checkSlugAvailabilitySettingsAction,
    deleteLogoAction,
    resetAvgPrepTimeAction,
    updateThankYouMessageAction,
    type ScheduleData,
    type NotificationChannels,
} from "@/lib/actions/settings"
import { BannedWordsManager } from "@/components/composed/BannedWordsManager"
import { ScheduleEditor, type ScheduleEditorHandle } from "@/components/composed/ScheduleEditor"
import { NotificationPreferencesEditor, type NotificationPreferencesEditorHandle } from "@/components/composed/NotificationPreferencesEditor"
import { createClient } from "@/lib/supabase/client"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SettingsData = {
    merchantName: string
    slug: string
    logoUrl: string | null
    brandColor: string | null
    fontFamily: string | null
    borderRadius: string | null
    themePattern: string | null
    defaultPrepTimeMin: number
    maxCapacity: number
    welcomeMessage: string
    thankYouMessage: string
    notificationsEnabled: boolean
    autoCloseEnabled: boolean
    /** Auto-computed value from calculate_avg_prep(). null = manual mode. */
    calculatedAvgPrepTime: number | null
    /** ISO timestamp of the last cron run. null = never run yet. */
    avgPrepComputedAt: string | null
    // Phase 2+ fields
    schedule: ScheduleData | null
    notificationChannels: NotificationChannels
    notificationSound: string
    approachingPositionEnabled: boolean
    approachingPositionThreshold: number
    approachingTimeEnabled: boolean
    approachingTimeThresholdMin: number
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
    { id: "display", label: "Affichage", icon: Sparkles },
    { id: "queue", label: "File d'attente", icon: Layers },
    { id: "schedule", label: "Horaires", icon: CalendarClock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "bannedwords", label: "Noms bannis", icon: ShieldAlert },
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
                    ? "border-brand-primary/40 bg-brand-primary/10"
                    : "border-border-default bg-surface-base",
            )}
        >
            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        checked
                            ? "border-brand-primary/40 bg-brand-primary/20 text-text-primary"
                            : "border-border-default bg-border-default/50 text-text-secondary",
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
// ChangedBadge
// ─────────────────────────────────────────────────────────────────────────────

function ChangedBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-brand-primary/40 bg-brand-primary/20 px-2 py-0.5 text-xs font-medium text-text-primary">
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
    const [activeTab, setActiveTab] = useState<(typeof NAV_SECTIONS)[number]["id"]>("identity")

    // ── Identity ──────────────────────────────────────────────────────────────
    const [identity, setIdentity] = useState({
        merchantName: initialData.merchantName,
        slug: initialData.slug,
        logoUrl: initialData.logoUrl,
        brand_color: initialData.brandColor,
        font_family: initialData.fontFamily,
        border_radius: initialData.borderRadius,
        theme_pattern: initialData.themePattern,
        defaultPrepTimeMin: initialData.defaultPrepTimeMin,
    })
    const [identityChanged, setIdentityChanged] = useState(false)
    const [, setIdentityError] = useState<string | null>(null)
    const [, setIdentitySuccess] = useState(false)
    const [isIdentityPending, startIdentityTransition] = useTransition()

    // ── Queue ─────────────────────────────────────────────────────────────────
    const [queue, setQueue] = useState({
        maxCapacity: initialData.maxCapacity,
        welcomeMessage: initialData.welcomeMessage,
        thankYouMessage: initialData.thankYouMessage,
        notificationsEnabled: initialData.notificationsEnabled,
        autoCloseEnabled: initialData.autoCloseEnabled,
    })
    const [queueChanged, setQueueChanged] = useState(false)
    const [, setQueueError] = useState<string | null>(null)
    const [, setQueueSuccess] = useState(false)
    const [isQueuePending, startQueueTransition] = useTransition()

    const [scheduleDirty, setScheduleDirty] = useState(false)
    const [notificationDirty, setNotificationDirty] = useState(false)
    const [embeddedEditorsReset, setEmbeddedEditorsReset] = useState(0)
    const scheduleEditorRef = useRef<ScheduleEditorHandle>(null)
    const notificationEditorRef = useRef<NotificationPreferencesEditorHandle>(null)

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
    // Upload de Logo
    // ─────────────────────────────────────────────────────────────────────────
    // Validation du fichier (format et taille max) puis upload via Supabase Storage.
    // L'URL publique est ensuite récupérée et sauvegardée dans l'état local avant la MAJ de la base.
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
    // Suppression de Logo
    // ─────────────────────────────────────────────────────────────────────────
    // Appelle le server action qui vide le dossier Storage et met à null `logo_url` en BDD.
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
    // Sauvegarde Identité
    // ─────────────────────────────────────────────────────────────────────────
    // Appelle le action server pour updater les tokens visuels (couleur, police, radius, slug, etc.).
    // En cas de succès, injecte dynamiquement les variables CSS modifiées dans le DOM pour un aperçu immédiat.
    const doSaveIdentity = () => {
        startIdentityTransition(async () => {
            const result = await updateMerchantIdentityAction({
                name: identity.merchantName,
                slug: identity.slug,
                logo_url: identity.logoUrl ?? undefined,
                brand_color: identity.brand_color ?? "#4F46E5",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                font_family: (identity.font_family as any) ?? "Inter",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                border_radius: (identity.border_radius as any) ?? "0.5rem",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                theme_pattern: (identity.theme_pattern as any) ?? "none",
                default_prep_time_min: identity.defaultPrepTimeMin,
            })
            if ("error" in result) {
                setIdentityError(result.error)
            } else {
                setIdentityChanged(false)
                setIdentitySuccess(true)
                
                // Update theme variables directly after successful save
                const root = document.getElementById("dashboard-root")
                if (root) {
                    if (identity.brand_color && isValidHexCode(identity.brand_color)) {
                        const contrast = getContrastYIQ(identity.brand_color) === "white" ? "#FFFFFF" : "#000000"
                        root.style.setProperty("--color-brand-primary", identity.brand_color)
                        root.style.setProperty("--color-brand-primary-hover", identity.brand_color)
                        root.style.setProperty("--color-border-focus", identity.brand_color)
                        root.style.setProperty("--color-text-on-primary", contrast)
                    }
                    if (identity.font_family) {
                        root.style.setProperty("font-family", `var(--font-brand)`)
                        root.style.setProperty("--font-brand", `var(--font-${identity.font_family.toLowerCase().replace(" ", "-")})`)
                    }
                    if (identity.border_radius) {
                        root.style.setProperty("--radius-brand", identity.border_radius)
                        root.style.setProperty("--radius-sm", identity.border_radius)
                        root.style.setProperty("--radius-md", identity.border_radius)
                        root.style.setProperty("--radius-lg", identity.border_radius)
                        root.style.setProperty("--radius-xl", identity.border_radius)
                        root.style.setProperty("--radius-2xl", identity.border_radius)
                    }
                }
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
            brand_color: initialData.brandColor,
            font_family: initialData.fontFamily,
            border_radius: initialData.borderRadius,
            theme_pattern: initialData.themePattern,
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

            // Also save the thank you message (separate action)
            if (queue.thankYouMessage !== initialData.thankYouMessage) {
                await updateThankYouMessageAction(queue.thankYouMessage || null)
            }
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
            thankYouMessage: initialData.thankYouMessage,
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

    const dirtySections = [
        identityChanged ? "Identité" : null,
        queueChanged ? "File" : null,
        scheduleDirty ? "Horaires" : null,
        notificationDirty ? "Notifications" : null,
    ].filter((section): section is string => section !== null)

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
                            <button
                                onClick={() => setActiveTab(id)}
                                className={cn(
                                    "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                                    activeTab === id
                                        ? "bg-brand-primary/10 text-brand-primary"
                                        : "text-text-secondary hover:bg-surface-card hover:text-text-primary",
                                    "transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
                                )}
                            >
                                <Icon size={15} aria-hidden="true" />
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="min-w-0 flex-1 pb-32">
                {/* ── Mobile horizontal nav ────────────────────── */}
                <div className="lg:hidden w-full overflow-x-auto no-scrollbar mb-6 pb-2">
                    <ul className="flex items-center gap-2 w-max">
                        {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                            <li key={id}>
                                <button
                                    onClick={() => setActiveTab(id)}
                                    className={cn(
                                        "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                        activeTab === id
                                            ? "bg-brand-primary text-text-inverse shadow-sm"
                                            : "bg-surface-card text-text-secondary border border-border-default hover:bg-surface-base"
                                    )}
                                >
                                    <Icon size={14} aria-hidden="true" />
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="flex max-w-2xl flex-col gap-10">
                    {/* ── Identity ──────────────────────────────────────── */}
                    {activeTab === "identity" && (
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

                                        {/* Name */}
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

                                        {/* Brand Color & Typography & Layout */}
                                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="min-w-0">
                                                <ColorPicker
                                                    label="Couleur de marque"
                                                    value={identity.brand_color ?? "#4F46E5"}
                                                    onChange={(e) => updateIdentity("brand_color", e.target.value)}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <Select
                                                    label="Typographie"
                                                    value={identity.font_family ?? "Inter"}
                                                    onChange={(e) => updateIdentity("font_family", e.target.value)}
                                                    options={[
                                                        { value: "Inter", label: "Inter" },
                                                        { value: "Roboto", label: "Roboto" },
                                                        { value: "Open Sans", label: "Open Sans" },
                                                        { value: "Lato", label: "Lato" },
                                                        { value: "Poppins", label: "Poppins" },
                                                    ]}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <Select
                                                    label="Arrondi des bords"
                                                    value={identity.border_radius ?? "0.5rem"}
                                                    onChange={(e) => updateIdentity("border_radius", e.target.value)}
                                                    options={[
                                                        { value: "0.25rem", label: "Léger" },
                                                        { value: "0.5rem", label: "Moyen" },
                                                        { value: "1rem", label: "Fort" },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Live Preview */}
                                    <div className="mt-8 border-t border-border-default pt-8">
                                        <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-text-primary">Choix de l&apos;arrière-plan</h3>
                                                <Select
                                                    label="Arrière-plan"
                                                    value={identity.theme_pattern ?? "none"}
                                                    onChange={(e) => updateIdentity("theme_pattern", e.target.value)}
                                                    options={[
                                                        { value: "none", label: "Uni" },
                                                        { value: "dots", label: "Points discrets" },
                                                        { value: "grid", label: "Grille subtile" },
                                                        { value: "glow", label: "Halo" },
                                                        { value: "food_burger", label: "Burger & Frite" },
                                                        { value: "food_pizza", label: "Pizzeria" },
                                                        { value: "food_coffee", label: "Café & Bistrot" },
                                                        { value: "food_cutlery", label: "Fourchette & Couteau" },
                                                    ]}
                                                />
                                            </div>

                                            <div>
                                                <h3 className="mb-2 text-sm font-semibold text-text-primary">Aperçu</h3>
                                                <div 
                                                    className="relative border border-border-default rounded-3xl overflow-hidden bg-surface-base h-[30vh]"
                                                    style={{ fontFamily: `var(--font-${(identity.font_family?.toLowerCase().replace(' ', '-') || 'inter')})` }}
                                                >
                                                    <div className="absolute inset-0 rounded-3xl border-2 border-border-default bg-surface-base shadow-lg" />
                                                    <div className="absolute inset-2 rounded-2xl overflow-hidden bg-surface-base">
                                                        {/* Tint Base */}
                                                        <div 
                                                            className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                                                            style={{ backgroundColor: identity.brand_color ?? '#4F46E5' }}
                                                        />
                                                        
                                                        {/* Pattern Preview */}
                                                        {identity.theme_pattern === "dots" && (
                                                            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(var(--color-text-primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                                                        )}
                                                        {identity.theme_pattern === "grid" && (
                                                            <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: "linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                                                        )}
                                                        {identity.theme_pattern === "glow" && (
                                                            <div className="absolute inset-0 z-0 opacity-[0.10] dark:opacity-[0.15]" style={{ background: `radial-gradient(circle at 50% 0%, ${identity.brand_color ?? '#4F46E5'}, transparent 60%)` }} />
                                                        )}
                                                        {(identity.theme_pattern?.startsWith("food_")) && (
                                                            <svg className="absolute inset-0 z-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] text-text-primary" aria-hidden="true">
                                                                <defs>
                                                                    <pattern id={`preview-motif`} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                                                                        {identity.theme_pattern === "food_burger" && <g transform="translate(26, 26) scale(1.4)"><path fill="currentColor" d="M18.06 6.81C16.91 4.54 14.61 3 12 3S7.09 4.54 5.94 6.81C5.66 7.55 6.22 8.33 7.02 8.33h9.96c.8 0 1.36-.78 1.08-1.52zM4 11h16v2H4zm1 3h14v1.5c0 1.93-1.57 3.5-3.5 3.5h-7C6.57 19 5 17.43 5 15.5V14z" /></g>}
                                                                        {identity.theme_pattern === "food_pizza" && <g transform="translate(26, 26) scale(1.4)"><path fill="currentColor" d="m12 14-1 1" /><path fill="currentColor" d="m13.75 18.25-1.25 1.42" /><path fill="currentColor" d="M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12" /><path fill="currentColor" d="M18.8 9.3a1 1 0 0 0 2.1 7.7" /><path fill="currentColor" d="M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z" /></g>}
                                                                        {identity.theme_pattern === "food_coffee" && <g transform="translate(26, 26) scale(1.4)"><path fill="currentColor" d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" /></g>}
                                                                        {identity.theme_pattern === "food_cutlery" && <g transform="translate(26, 26) scale(1.4)"><path fill="currentColor" d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.86 3.75 3.97V22h2.5v-9.03C11.34 12.86 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" /></g>}
                                                                    </pattern>
                                                                </defs>
                                                                <rect x="0" y="0" width="100%" height="100%" fill="url(#preview-motif)" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            
                        </SectionBlock>
                    </motion.div>
                )}

                    {/* ── Display mode ──────────────────────────────────── */}
                    {activeTab === "display" && (
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={sectionVariants}
                    >
                        <SectionBlock
                            id="display"
                            icon={Sparkles}
                            title="Affichage"
                            description="Mode clair ou sombre pour votre tableau de bord."
                        >
                            <Card>
                                <CardContent>
                                    <div className="flex flex-col gap-3 pt-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-text-primary">
                                                    Thème de l&apos;application
                                                </h4>
                                                <p className="text-sm text-text-secondary">
                                                    Choisissez votre préférence visuelle pour le tableau de bord.
                                                </p>
                                            </div>
                                            <div className="w-[300px] shrink-0">
                                                <ThemeSwitcher />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </SectionBlock>
                    </motion.div>
                )}

                    {/* ── Queue config ───────────────────────────────────── */}
                    {activeTab === "queue" && (
                    <motion.div
                        custom={0}
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
                                        <Textarea
                                            label="Message de remerciement"
                                            value={queue.thankYouMessage}
                                            onChange={(e) =>
                                                updateQueue(
                                                    "thankYouMessage",
                                                    e.target.value,
                                                )
                                            }
                                            hint="Affiché lorsque le client a été servi. Laissez vide pour le message par défaut."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </SectionBlock>
                    </motion.div>
                )}

                    {/* ── Schedule ──────────────────────────────────────── */}
                    {activeTab === "schedule" && (
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={sectionVariants}
                    >
                        <SectionBlock
                            id="schedule"
                            icon={CalendarClock}
                            title="Horaires d'ouverture"
                            description="Configurez les horaires de la file par jour de la semaine et ajoutez des jours exceptionnels."
                        >
                            <Card>
                                <CardContent>
                                    <div className="mb-4 flex flex-col gap-1">
                                        <p className="text-sm font-medium text-text-primary">
                                            Heures d&apos;ouverture et fermetures exceptionnelles
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            L&apos;éditeur ci-dessous gère les plages hebdomadaires et les jours spéciaux dans une seule vue.
                                        </p>
                                    </div>
                                    <ScheduleEditor
                                        key={embeddedEditorsReset}
                                        ref={scheduleEditorRef}
                                        initialSchedule={initialData.schedule}
                                        showSaveButton={false}
                                        onDirtyChange={setScheduleDirty}
                                    />
                                </CardContent>
                            </Card>
                        </SectionBlock>
                    </motion.div>
                )}

                    {/* ── Notification Preferences ──────────────────────── */}
                    {activeTab === "notifications" && (
                    <motion.div
                        custom={4}
                        initial="hidden"
                        animate="visible"
                        variants={sectionVariants}
                    >
                        <SectionBlock
                            id="notification-prefs"
                            icon={BellRing}
                            title="Notifications"
                            description="Regroupez ici les notifications clients, les canaux et les automatisations de file."
                        >
                            <div className="flex flex-col gap-5">
                                <Card>
                                    <CardContent>
                                        <div className="flex flex-col gap-3">
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
                                                onChange={(v) => updateQueue("notificationsEnabled", v)}
                                            />
                                            <ToggleRow
                                                icon={Zap}
                                                label="Fermeture automatique"
                                                description="Passe le ticket en « terminé » si aucune action dans les 5 min après l'appel."
                                                checked={queue.autoCloseEnabled}
                                                onChange={(v) => updateQueue("autoCloseEnabled", v)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <NotificationPreferencesEditor
                                    key={embeddedEditorsReset}
                                    ref={notificationEditorRef}
                                    initialChannels={initialData.notificationChannels}
                                    initialSound={initialData.notificationSound}
                                    initialApproachingPosition={{
                                        enabled: initialData.approachingPositionEnabled,
                                        threshold: initialData.approachingPositionThreshold,
                                    }}
                                    initialApproachingTime={{
                                        enabled: initialData.approachingTimeEnabled,
                                        thresholdMin: initialData.approachingTimeThresholdMin,
                                    }}
                                    showSaveButton={false}
                                    onDirtyChange={setNotificationDirty}
                                />
                            </div>
                        </SectionBlock>
                    </motion.div>
                )}
                    {/* ── Banned Words ──────────────────────────────────── */}
                    {activeTab === "bannedwords" && (
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={sectionVariants}
                    >
                        <SectionBlock
                            id="bannedwords"
                            icon={ShieldAlert}
                            title="Noms bannis"
                            description="Les prénoms signalés sont automatiquement bloqués lors de l'inscription."
                        >
                            <Card>
                                <CardContent>
                                    <BannedWordsManager />
                                </CardContent>
                            </Card>
                        </SectionBlock>
                    </motion.div>
                )}

                    {/* ── Wait time (live) ───────────────────────────────── */}
                    {activeTab === "waittime" && (
                    <motion.div
                        custom={0}
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
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-feedback-success/35 bg-feedback-success/20 px-2.5 py-0.5 text-xs font-medium text-text-primary">
                                        <Sparkles
                                            size={11}
                                            className="text-feedback-success"
                                            aria-hidden="true"
                                        />
                                        Ajusté auto
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-base px-2.5 py-0.5 text-xs font-medium text-text-primary">
                                        Temps manuel
                                    </span>
                                )
                            }
                        >
                            <Card>
                                <CardContent>
                                    <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">
                                                Temps de préparation moyen
                                            </p>
                                            <p className="mt-1 text-sm text-text-secondary">
                                                Modifiez manuellement la base utilisée par l&apos;algorithme quand les données automatiques ne sont pas encore fiables.
                                            </p>
                                        </div>
                                        <Input
                                            label="Temps moyen (minutes)"
                                            type="number"
                                            min={1}
                                            max={120}
                                            value={identity.defaultPrepTimeMin}
                                            onChange={(e) =>
                                                updateIdentity(
                                                    "defaultPrepTimeMin",
                                                    Number(e.target.value),
                                                )
                                            }
                                            hint="Utilisé comme valeur de secours et comme base de départ de l'estimation."
                                        />
                                    </div>

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
                )}
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
                        commerce. Êtes-vous sûr-e ?
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
                            className="shrink-0 text-feedback-error"
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

            <AnimatePresence>
                {dirtySections.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
                    >
                        <div className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-card p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary">
                                    Modifications non enregistrées
                                </p>
                                <p className="mt-1 text-sm text-text-secondary">
                                    Sections modifiées : {dirtySections.join(", ")}.
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        handleResetIdentity()
                                        handleResetQueue()
                                        setScheduleDirty(false)
                                        setNotificationDirty(false)
                                        setEmbeddedEditorsReset((value) => value + 1)
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        if (identityChanged) handleSaveIdentity()
                                        if (queueChanged) handleSaveQueue()
                                        if (scheduleDirty) void scheduleEditorRef.current?.save()
                                        if (notificationDirty) void notificationEditorRef.current?.save()
                                    }}
                                    isLoading={isIdentityPending || isQueuePending}
                                >
                                    Enregistrer les modifications
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export { SettingsPanel, type SettingsPanelProps, type SettingsData }
