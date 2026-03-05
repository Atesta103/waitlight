"use client"

import { useState } from "react"
import { ThemePicker } from "@/components/ui/ThemePicker"
import {
    THEME_PRESETS,
    DEFAULT_THEME,
    themeToStyle,
    type MerchantTheme,
} from "@/lib/utils/theme"

/* ─── Atoms ─── */
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Spinner } from "@/components/ui/Spinner"
import { Avatar } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { Checkbox } from "@/components/ui/Checkbox"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Toggle } from "@/components/ui/Toggle"
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogFooter,
} from "@/components/ui/Dialog"
import { Tabs } from "@/components/ui/Tabs"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Dropdown } from "@/components/ui/Dropdown"

/* ─── Molecules ─── */
import { TicketCard } from "@/components/composed/TicketCard"
import { QueuePositionCard } from "@/components/composed/QueuePositionCard"
import { ConnectionStatus } from "@/components/composed/ConnectionStatus"
import { WaitTimeEstimate } from "@/components/composed/WaitTimeEstimate"
import { WaitTimePicker } from "@/components/composed/WaitTimePicker"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { JoinForm } from "@/components/composed/JoinForm"
import { StatCard } from "@/components/composed/StatCard"
import { EmptyState } from "@/components/composed/EmptyState"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"
import { ConfirmDialog } from "@/components/composed/ConfirmDialog"
import { SlugInput } from "@/components/composed/SlugInput"
import { CapacityIndicator } from "@/components/composed/CapacityIndicator"
import { ActivityFeed } from "@/components/composed/ActivityFeed"

/* ─── Organisms ─── */
import { QueueList } from "@/components/sections/QueueList"
import { CustomerWaitView } from "@/components/sections/CustomerWaitView"
import { DashboardHeader } from "@/components/sections/DashboardHeader"
import { OnboardingForm } from "@/components/sections/OnboardingForm"
import { StatsPanel } from "@/components/sections/StatsPanel"
import { SettingsPanel } from "@/components/sections/SettingsPanel"

/* ─── Auth ─── */
import { Divider } from "@/components/ui/Divider"
import { PasswordInput } from "@/components/composed/PasswordInput"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"
import { SocialAuthButtons } from "@/components/composed/SocialAuthButtons"
import { LoginForm } from "@/components/sections/LoginForm"
import { RegisterForm } from "@/components/sections/RegisterForm"
import { ForgotPasswordForm } from "@/components/sections/ForgotPasswordForm"
import { ResetPasswordForm } from "@/components/sections/ResetPasswordForm"

/* ─── Notifications ─── */
import { NotificationSandbox } from "@/components/composed/NotificationSandbox"

/* ─── Icons for demos ─── */
import {
    Users,
    Clock,
    BarChart3,
    Inbox,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    List,
    Settings,
    ChartBar,
    CheckCircle2,
} from "lucide-react"

/* ─── Section wrapper ─── */
function Section({
    id,
    title,
    children,
}: {
    id: string
    title: string
    children: React.ReactNode
}) {
    return (
        <section id={id} className="scroll-mt-20">
            <h2 className="mb-4 border-b border-border-default pb-2 text-xl font-bold text-text-primary">
                {title}
            </h2>
            <div className="space-y-6">{children}</div>
        </section>
    )
}

function SubSection({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
                {title}
            </h3>
            {children}
        </div>
    )
}

/* ─── Mock data ───
 * Fixed ISO strings avoid SSR/client hydration mismatch (no Date.now() at module level).
 */
const mockQueue = [
    {
        id: "1",
        customerName: "Marie Dupont",
        status: "waiting" as const,
        position: 1,
        joinedAt: "2026-03-02T09:50:00.000Z",
    },
    {
        id: "2",
        customerName: "Jean Martin",
        status: "waiting" as const,
        position: 2,
        joinedAt: "2026-03-02T09:52:00.000Z",
    },
    {
        id: "3",
        customerName: "Sophie Bernard",
        status: "called" as const,
        position: 0,
        joinedAt: "2026-03-02T09:45:00.000Z",
    },
    {
        id: "4",
        customerName: "Pierre Moreau",
        status: "done" as const,
        joinedAt: "2026-03-02T09:30:00.000Z",
    },
    {
        id: "5",
        customerName: "Luc Petit",
        status: "cancelled" as const,
        joinedAt: "2026-03-02T09:40:00.000Z",
    },
]

const NAV_ITEMS = [
    { id: "tokens", label: "Tokens" },
    { id: "atoms", label: "Atoms" },
    { id: "molecules", label: "Molecules" },
    { id: "molecules-merchant", label: "Molecules (Marchand)" },
    { id: "organisms", label: "Organisms" },
    { id: "organisms-merchant", label: "Organisms (Marchand)" },
    { id: "notifications", label: "Notifications" },
    { id: "auth", label: "Auth" },
]

/* ─── Mock activity data ───
 * Fixed ISO strings avoid SSR/client hydration mismatch (no Date.now() at module level).
 * [2026-03-02] — Decision — All design-system mock timestamps must be static literals.
 */
const mockActivity = [
    {
        id: "a1",
        action: "joined" as const,
        customerName: "Marie Dupont",
        timestamp: "2026-03-02T10:00:00.000Z",
    },
    {
        id: "a2",
        action: "called" as const,
        customerName: "Jean Martin",
        timestamp: "2026-03-02T09:55:00.000Z",
    },
    {
        id: "a3",
        action: "completed" as const,
        customerName: "Sophie Bernard",
        timestamp: "2026-03-02T09:50:00.000Z",
    },
    {
        id: "a4",
        action: "cancelled" as const,
        customerName: "Luc Petit",
        timestamp: "2026-03-02T09:45:00.000Z",
    },
]

/* ─── Mock hourly data ─── */
const mockHourlyData = [
    { hour: "8h", count: 2 },
    { hour: "9h", count: 5 },
    { hour: "10h", count: 12 },
    { hour: "11h", count: 18 },
    { hour: "12h", count: 25 },
    { hour: "13h", count: 15 },
    { hour: "14h", count: 8 },
    { hour: "15h", count: 10 },
    { hour: "16h", count: 14 },
    { hour: "17h", count: 20 },
    { hour: "18h", count: 16 },
    { hour: "19h", count: 6 },
]

/**
 * Design-system-only helper: renders the ForgotPasswordForm success state
 * immediately (bypasses the internal submit flow) so the DS page can preview
 * both the idle and success states side-by-side.
 */
function ForgotPasswordFormSuccess() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-4 py-6 text-center"
        >
            <CheckCircle2
                size={48}
                className="text-feedback-success"
                aria-hidden="true"
            />
            <p className="text-base font-medium text-text-primary">
                E-mail envoyé&nbsp;!
            </p>
            <p className="max-w-xs text-sm text-text-secondary">
                Si un compte existe pour cette adresse, vous recevrez un lien de
                réinitialisation dans les prochaines minutes.
            </p>
            <a
                href="#auth"
                className="mt-2 text-sm font-medium text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
            >
                Retour à la connexion
            </a>
        </div>
    )
}

/* ─── Mock slug checker ─── */
const mockCheckSlug = async (slug: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800))
    return slug !== "boulangerie-martin"
}

/* ─── Main page ─── */
export default function DesignSystemPage() {
    const [toggleState, setToggleState] = useState(false)
    const [dashboardOpen, setDashboardOpen] = useState(true)
    const [demoPosition, setDemoPosition] = useState(3)
    const [theme, setTheme] = useState<MerchantTheme>(DEFAULT_THEME)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [demoTab, setDemoTab] = useState("queue")
    const [demoSlug, setDemoSlug] = useState("")

    return (
        <div className="flex min-h-screen">
            {/* ─── Sidebar nav ─── */}
            <nav className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-r border-border-default bg-surface-card p-4 lg:flex lg:flex-col lg:gap-6">
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-secondary">
                        Design System
                    </p>
                    <ul className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="border-t border-border-default pt-4">
                    <ThemePicker theme={theme} onChange={setTheme} />
                </div>
            </nav>

            {/* ─── Content (theme vars scoped here) ─── */}
            <main className="flex-1 p-6 lg:p-10" style={themeToStyle(theme)}>
                <div className="mx-auto max-w-4xl space-y-16">
                    <header>
                        <h1 className="text-3xl font-bold text-text-primary">
                            Wait-Light Design System
                        </h1>
                        <p className="mt-2 text-text-secondary">
                            Composants visuels du projet, organisés en Atoms →
                            Molecules → Organisms.
                        </p>
                    </header>

                    {/* ═══════════════════════════════ TOKENS ═══════════════════════════════ */}
                    <Section id="tokens" title="Design Tokens">
                        <SubSection title="Couleurs — Brand">
                            <div className="flex flex-wrap gap-3">
                                {[
                                    {
                                        name: "brand-primary",
                                        className: "bg-brand-primary",
                                    },
                                    {
                                        name: "brand-primary-hover",
                                        className: "bg-brand-primary-hover",
                                    },
                                    {
                                        name: "brand-secondary",
                                        className: "bg-brand-secondary",
                                    },
                                    {
                                        name: "brand-secondary-hover",
                                        className: "bg-brand-secondary-hover",
                                    },
                                ].map((c) => (
                                    <div
                                        key={c.name}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div
                                            className={`h-12 w-12 rounded-lg border border-border-default ${c.className}`}
                                        />
                                        <span className="text-xs text-text-secondary">
                                            {c.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SubSection>

                        <SubSection title="Couleurs — Status">
                            <div className="flex flex-wrap gap-3">
                                {[
                                    {
                                        name: "waiting",
                                        bg: "bg-status-waiting-bg",
                                        fg: "bg-status-waiting",
                                    },
                                    {
                                        name: "called",
                                        bg: "bg-status-called-bg",
                                        fg: "bg-status-called",
                                    },
                                    {
                                        name: "done",
                                        bg: "bg-status-done-bg",
                                        fg: "bg-status-done",
                                    },
                                    {
                                        name: "cancelled",
                                        bg: "bg-status-cancelled-bg",
                                        fg: "bg-status-cancelled",
                                    },
                                ].map((c) => (
                                    <div
                                        key={c.name}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div className="flex gap-1">
                                            <div
                                                className={`h-12 w-12 rounded-lg border border-border-default ${c.bg}`}
                                            />
                                            <div
                                                className={`h-12 w-12 rounded-lg border border-border-default ${c.fg}`}
                                            />
                                        </div>
                                        <span className="text-xs text-text-secondary">
                                            {c.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SubSection>

                        <SubSection title="Couleurs — Surfaces & Text">
                            <div className="flex flex-wrap gap-3">
                                {[
                                    {
                                        name: "surface-base",
                                        className: "bg-surface-base",
                                    },
                                    {
                                        name: "surface-card",
                                        className: "bg-surface-card",
                                    },
                                    {
                                        name: "text-primary",
                                        className: "bg-text-primary",
                                    },
                                    {
                                        name: "text-secondary",
                                        className: "bg-text-secondary",
                                    },
                                    {
                                        name: "text-disabled",
                                        className: "bg-text-disabled",
                                    },
                                    {
                                        name: "border-default",
                                        className: "bg-border-default",
                                    },
                                    {
                                        name: "border-focus",
                                        className: "bg-border-focus",
                                    },
                                ].map((c) => (
                                    <div
                                        key={c.name}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div
                                            className={`h-12 w-12 rounded-lg border border-border-default ${c.className}`}
                                        />
                                        <span className="text-xs text-text-secondary">
                                            {c.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SubSection>

                        <SubSection title="Couleurs — Feedback">
                            <div className="flex flex-wrap gap-3">
                                {[
                                    {
                                        name: "error",
                                        bg: "bg-feedback-error-bg",
                                        fg: "bg-feedback-error",
                                    },
                                    {
                                        name: "success",
                                        bg: "bg-feedback-success-bg",
                                        fg: "bg-feedback-success",
                                    },
                                    {
                                        name: "warning",
                                        bg: "bg-feedback-warning-bg",
                                        fg: "bg-feedback-warning",
                                    },
                                    {
                                        name: "info",
                                        bg: "bg-feedback-info-bg",
                                        fg: "bg-feedback-info",
                                    },
                                ].map((c) => (
                                    <div
                                        key={c.name}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div className="flex gap-1">
                                            <div
                                                className={`h-12 w-12 rounded-lg border border-border-default ${c.bg}`}
                                            />
                                            <div
                                                className={`h-12 w-12 rounded-lg border border-border-default ${c.fg}`}
                                            />
                                        </div>
                                        <span className="text-xs text-text-secondary">
                                            {c.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SubSection>

                        <SubSection title="Typographie">
                            <div className="space-y-2">
                                <p className="text-3xl font-bold">
                                    heading-xl — 3xl bold
                                </p>
                                <p className="text-2xl font-bold">
                                    heading-lg — 2xl bold
                                </p>
                                <p className="text-lg font-semibold">
                                    heading-md — lg semibold
                                </p>
                                <p className="text-base">
                                    body-lg — base regular
                                </p>
                                <p className="text-sm">body-sm — sm regular</p>
                                <p className="text-sm font-medium">
                                    label — sm medium
                                </p>
                                <p className="text-xs">caption — xs regular</p>
                            </div>
                        </SubSection>

                        <SubSection title="Border Radius">
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { name: "sm", className: "rounded-sm" },
                                    { name: "md", className: "rounded-md" },
                                    { name: "lg", className: "rounded-lg" },
                                    { name: "full", className: "rounded-full" },
                                ].map((r) => (
                                    <div
                                        key={r.name}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div
                                            className={`h-12 w-12 border-2 border-brand-primary bg-brand-secondary/20 ${r.className}`}
                                        />
                                        <span className="text-xs text-text-secondary">
                                            {r.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SubSection>
                    </Section>

                    {/* ═══════════════════════════════ ATOMS ═══════════════════════════════ */}
                    <Section id="atoms" title="Atoms (components/ui/)">
                        <SubSection title="Button">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button variant="primary">Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="destructive">
                                    Destructive
                                </Button>
                                <Button variant="primary" isLoading>
                                    Loading
                                </Button>
                                <Button variant="primary" disabled>
                                    Disabled
                                </Button>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <Button size="sm">Small</Button>
                                <Button size="md">Medium</Button>
                                <Button size="lg">Large</Button>
                            </div>
                        </SubSection>

                        <SubSection title="Input">
                            <div className="grid max-w-md gap-4">
                                <Input
                                    label="Nom"
                                    placeholder="Entrez votre nom"
                                />
                                <Input
                                    label="Avec hint"
                                    placeholder="Ex : Marie"
                                    hint="Visible uniquement par le commerçant."
                                />
                                <Input
                                    label="Avec erreur"
                                    placeholder="Ex : Marie"
                                    error="Ce champ est obligatoire."
                                />
                                <Input
                                    label="Désactivé"
                                    placeholder="Non modifiable"
                                    disabled
                                />
                            </div>
                        </SubSection>

                        <SubSection title="Select">
                            <div className="max-w-md">
                                <Select
                                    label="Catégorie"
                                    placeholder="Choisir une option"
                                    options={[
                                        {
                                            value: "restaurant",
                                            label: "Restaurant",
                                        },
                                        {
                                            value: "boulangerie",
                                            label: "Boulangerie",
                                        },
                                        {
                                            value: "pharmacie",
                                            label: "Pharmacie",
                                        },
                                    ]}
                                />
                            </div>
                        </SubSection>

                        <SubSection title="Textarea">
                            <div className="max-w-md">
                                <Textarea
                                    label="Message d'accueil"
                                    placeholder="Bienvenue chez nous !"
                                    hint="Affiché aux clients lorsqu'ils scannent le QR code."
                                />
                            </div>
                        </SubSection>

                        <SubSection title="Checkbox">
                            <div className="space-y-3">
                                <Checkbox label="J'accepte les conditions d'utilisation." />
                                <Checkbox
                                    label="Avec une erreur"
                                    error="Vous devez accepter pour continuer."
                                />
                                <Checkbox label="Désactivé" disabled />
                            </div>
                        </SubSection>

                        <SubSection title="Toggle">
                            <Toggle
                                checked={toggleState}
                                onChange={setToggleState}
                                label={toggleState ? "Activé" : "Désactivé"}
                            />
                        </SubSection>

                        <SubSection title="Badge">
                            <div className="flex flex-wrap gap-3">
                                <Badge status="waiting" />
                                <Badge status="called" />
                                <Badge status="done" />
                                <Badge status="cancelled" />
                                <Badge status="waiting" showIcon={false}>
                                    Sans icône
                                </Badge>
                            </div>
                        </SubSection>

                        <SubSection title="Avatar">
                            <div className="flex flex-wrap items-center gap-3">
                                <Avatar name="Marie Dupont" size="sm" />
                                <Avatar name="Jean Martin" size="md" />
                                <Avatar name="Sophie Bernard" size="lg" />
                                <Avatar name="Pierre Moreau" size="md" />
                                <Avatar name="Luc Petit" size="md" />
                                <Avatar name="Anna" size="md" />
                            </div>
                        </SubSection>

                        <SubSection title="Card">
                            <div className="max-w-sm">
                                <Card>
                                    <CardHeader>
                                        <span className="font-medium">
                                            Titre de la carte
                                        </span>
                                        <Badge status="waiting" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-text-secondary">
                                            Contenu de la carte. Utilisez
                                            CardHeader et CardContent pour
                                            structurer.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </SubSection>

                        <SubSection title="Spinner">
                            <div className="flex items-center gap-6">
                                <Spinner size="sm" />
                                <Spinner size="md" />
                                <Spinner size="lg" />
                            </div>
                        </SubSection>

                        <SubSection title="Skeleton">
                            <div className="flex max-w-sm flex-col gap-3">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-20 w-full" />
                                <div className="flex gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex flex-1 flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </div>
                        </SubSection>

                        <SubSection title="Dialog">
                            <Button
                                variant="secondary"
                                onClick={() => setDialogOpen(true)}
                            >
                                Ouvrir le Dialog
                            </Button>
                            <Dialog
                                open={dialogOpen}
                                onClose={() => setDialogOpen(false)}
                            >
                                <DialogHeader
                                    onClose={() => setDialogOpen(false)}
                                >
                                    Titre du Dialog
                                </DialogHeader>
                                <DialogContent>
                                    <p className="text-sm text-text-secondary">
                                        Contenu du dialog. Utilisé pour les
                                        confirmations, formulaires modaux et
                                        informations contextuelles.
                                    </p>
                                </DialogContent>
                                <DialogFooter>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Confirmer
                                    </Button>
                                </DialogFooter>
                            </Dialog>
                        </SubSection>

                        <SubSection title="Tabs">
                            <div className="max-w-md">
                                <Tabs
                                    tabs={[
                                        {
                                            value: "queue",
                                            label: "File",
                                            icon: <List size={16} />,
                                        },
                                        {
                                            value: "stats",
                                            label: "Statistiques",
                                            icon: <ChartBar size={16} />,
                                        },
                                        {
                                            value: "settings",
                                            label: "Paramètres",
                                            icon: <Settings size={16} />,
                                        },
                                    ]}
                                    value={demoTab}
                                    onChange={setDemoTab}
                                />
                                <p className="mt-3 text-sm text-text-secondary">
                                    Onglet sélectionné :{" "}
                                    <strong>{demoTab}</strong>
                                </p>
                            </div>
                        </SubSection>

                        <SubSection title="ProgressBar">
                            <div className="flex max-w-md flex-col gap-4">
                                <ProgressBar
                                    value={30}
                                    max={100}
                                    label="Défaut"
                                    showValue
                                    size="sm"
                                />
                                <ProgressBar
                                    value={65}
                                    max={100}
                                    label="Moyen"
                                    showValue
                                    size="md"
                                />
                                <ProgressBar
                                    value={75}
                                    max={100}
                                    label="Attention"
                                    showValue
                                    variant="warning"
                                    size="md"
                                />
                                <ProgressBar
                                    value={95}
                                    max={100}
                                    label="Critique"
                                    showValue
                                    variant="error"
                                    size="lg"
                                />
                                <ProgressBar
                                    value={100}
                                    max={100}
                                    label="Complet"
                                    showValue
                                    variant="success"
                                    size="md"
                                />
                            </div>
                        </SubSection>

                        <SubSection title="Dropdown">
                            <Dropdown
                                trigger={
                                    <Button variant="ghost" size="sm">
                                        <MoreVertical
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        Actions
                                    </Button>
                                }
                                items={[
                                    {
                                        label: "Voir les détails",
                                        icon: <Eye size={16} />,
                                        onClick: () => {},
                                    },
                                    {
                                        label: "Modifier",
                                        icon: <Edit size={16} />,
                                        onClick: () => {},
                                    },
                                    {
                                        label: "Supprimer",
                                        icon: <Trash2 size={16} />,
                                        onClick: () => {},
                                        variant: "destructive",
                                    },
                                ]}
                                align="left"
                            />
                        </SubSection>
                    </Section>

                    {/* ═══════════════════════════════ MOLECULES ═══════════════════════════════ */}
                    <Section
                        id="molecules"
                        title="Molecules (components/composed/)"
                    >
                        <SubSection title="TicketCard">
                            <div className="grid max-w-md gap-3">
                                <TicketCard
                                    id="demo-1"
                                    customerName="Marie Dupont"
                                    status="waiting"
                                    position={1}
                                    joinedAt="2026-03-02T09:50:00.000Z"
                                    onCall={() => {}}
                                    onCancel={() => {}}
                                />
                                <TicketCard
                                    id="demo-2"
                                    customerName="Jean Martin"
                                    status="called"
                                    joinedAt="2026-03-02T09:45:00.000Z"
                                    onComplete={() => {}}
                                    onCancel={() => {}}
                                />
                                <TicketCard
                                    id="demo-3"
                                    customerName="Sophie Bernard"
                                    status="done"
                                    joinedAt="2026-03-02T09:30:00.000Z"
                                />
                                <TicketCard
                                    id="demo-4"
                                    customerName="Luc Petit"
                                    status="cancelled"
                                    joinedAt="2026-03-02T09:40:00.000Z"
                                />
                            </div>
                        </SubSection>

                        <SubSection title="QueuePositionCard">
                            <div className="flex flex-wrap items-start gap-12">
                                {/* Interactive demo */}
                                <div className="flex flex-col gap-3">
                                    <QueuePositionCard
                                        position={demoPosition}
                                        totalWaiting={demoPosition + 4}
                                        estimatedMinutes={demoPosition * 3}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setDemoPosition((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                        >
                                            −1 (avancer)
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setDemoPosition((p) => p + 1)
                                            }
                                        >
                                            +1
                                        </Button>
                                    </div>
                                </div>
                                {/* Next in line */}
                                <div className="flex flex-col gap-1">
                                    <p className="mb-2 text-xs text-text-secondary">
                                        Position&nbsp;1
                                    </p>
                                    <QueuePositionCard
                                        position={1}
                                        totalWaiting={5}
                                        estimatedMinutes={2}
                                    />
                                </div>
                                {/* Loading skeleton */}
                                <div className="flex flex-col gap-1">
                                    <p className="mb-2 text-xs text-text-secondary">
                                        Chargement
                                    </p>
                                    <QueuePositionCard
                                        position={null}
                                        totalWaiting={null}
                                        estimatedMinutes={null}
                                    />
                                </div>
                            </div>
                        </SubSection>

                        <SubSection title="WaitTimeEstimate">
                            <div className="flex flex-col gap-2">
                                <WaitTimeEstimate minutes={null} />
                                <WaitTimeEstimate minutes={0} />
                                <WaitTimeEstimate minutes={1} />
                                <WaitTimeEstimate minutes={12} />
                            </div>
                        </SubSection>

                        <SubSection title="WaitTimePicker">
                            <div className="grid gap-4 md:grid-cols-2">
                                <WaitTimePicker queueAvgMinutes={12} />
                                <WaitTimePicker queueAvgMinutes={null} />
                            </div>
                        </SubSection>

                        <SubSection title="ConnectionStatus">
                            <div className="flex flex-col gap-2 max-w-md">
                                <ConnectionStatus state="connected" />
                                <ConnectionStatus state="reconnecting" />
                                <ConnectionStatus state="offline" />
                            </div>
                        </SubSection>

                        <SubSection title="StatusBanner">
                            <div className="grid gap-3 max-w-md">
                                <StatusBanner
                                    variant="called"
                                    title="C'est votre tour !"
                                    description="Présentez-vous au comptoir."
                                />
                                <StatusBanner
                                    variant="done"
                                    title="Merci !"
                                    description="Votre visite est terminée."
                                />
                                <StatusBanner
                                    variant="closed"
                                    title="File fermée"
                                    description="Revenez demain !"
                                />
                                <StatusBanner
                                    variant="full"
                                    title="File complète"
                                    description="Réessayez plus tard."
                                />
                                <StatusBanner
                                    variant="error"
                                    title="Erreur"
                                    description="Ce ticket n'est plus valide."
                                />
                            </div>
                        </SubSection>

                        <SubSection title="JoinForm">
                            <div className="max-w-md">
                                <JoinForm
                                    onSubmit={(data) =>
                                        alert(JSON.stringify(data))
                                    }
                                />
                            </div>
                        </SubSection>

                        <SubSection title="StatCard">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <StatCard
                                    label="Clients servis"
                                    value={42}
                                    trend="up"
                                    trendLabel="+12% vs hier"
                                    icon={<Users size={20} />}
                                />
                                <StatCard
                                    label="Temps moyen"
                                    value="8 min"
                                    trend="down"
                                    trendLabel="-2 min"
                                    icon={<Clock size={20} />}
                                />
                                <StatCard
                                    label="Taux d'abandon"
                                    value="5%"
                                    trend="neutral"
                                    trendLabel="Stable"
                                    icon={<BarChart3 size={20} />}
                                />
                            </div>
                        </SubSection>

                        <SubSection title="EmptyState">
                            <EmptyState
                                icon={<Inbox size={32} />}
                                title="Aucun résultat"
                                description="Il n'y a rien à afficher pour le moment."
                                action={
                                    <Button variant="primary" size="sm">
                                        Rafraîchir
                                    </Button>
                                }
                            />
                        </SubSection>
                    </Section>

                    {/* ═══════════════════════ MOLECULES — MARCHAND ═══════════════════════ */}
                    <Section
                        id="molecules-merchant"
                        title="Molecules — Côté Marchand"
                    >
                        <SubSection title="QRCodeDisplay">
                            <QRCodeDisplay slug="boulangerie-martin" />
                        </SubSection>

                        <SubSection title="ConfirmDialog">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmOpen(true)}
                            >
                                Fermer la file (demo)
                            </Button>
                            <ConfirmDialog
                                open={confirmOpen}
                                onClose={() => setConfirmOpen(false)}
                                onConfirm={() => setConfirmOpen(false)}
                                title="Fermer la file ?"
                                description="Les clients en attente ne seront pas annulés, mais aucun nouveau client ne pourra rejoindre la file."
                                confirmLabel="Fermer la file"
                                variant="destructive"
                            />
                        </SubSection>

                        <SubSection title="SlugInput">
                            <div className="max-w-md">
                                <SlugInput
                                    value={demoSlug}
                                    onChange={setDemoSlug}
                                    checkAvailability={mockCheckSlug}
                                />
                                <p className="mt-2 text-xs text-text-secondary">
                                    Essayez &quot;boulangerie-martin&quot;
                                    (pris) ou tout autre slug.
                                </p>
                            </div>
                        </SubSection>

                        <SubSection title="CapacityIndicator">
                            <div className="grid max-w-md gap-3">
                                <CapacityIndicator current={5} max={20} />
                                <CapacityIndicator current={15} max={20} />
                                <CapacityIndicator current={20} max={20} />
                            </div>
                        </SubSection>

                        <SubSection title="ActivityFeed">
                            <div className="max-w-md">
                                <ActivityFeed items={mockActivity} />
                            </div>
                        </SubSection>

                        <SubSection title="ActivityFeed — Vide">
                            <div className="max-w-md">
                                <ActivityFeed items={[]} />
                            </div>
                        </SubSection>
                    </Section>

                    {/* ═══════════════════════════════ ORGANISMS ═══════════════════════════════ */}
                    <Section
                        id="organisms"
                        title="Organisms (components/sections/)"
                    >
                        <SubSection title="DashboardHeader">
                            <DashboardHeader
                                isOpen={dashboardOpen}
                                waitingCount={
                                    mockQueue.filter(
                                        (i) => i.status === "waiting",
                                    ).length
                                }
                                onToggleOpen={setDashboardOpen}
                            />
                        </SubSection>

                        <SubSection title="QueueList">
                            <QueueList
                                merchantId="00000000-0000-0000-0000-000000000001"
                                initialItems={mockQueue.map((i) => ({
                                    id: i.id,
                                    merchant_id:
                                        "00000000-0000-0000-0000-000000000001",
                                    customer_name: i.customerName,
                                    status: i.status,
                                    joined_at: i.joinedAt,
                                    called_at: null,
                                    done_at: null,
                                }))}
                            />
                        </SubSection>

                        <SubSection title="QueueList — Empty">
                            <QueueList merchantId="00000000-0000-0000-0000-000000000001" />
                        </SubSection>

                        <SubSection title="CustomerWaitView — Waiting">
                            <div className="mx-auto max-w-sm rounded-lg border border-border-default p-6">
                                <CustomerWaitView
                                    status="waiting"
                                    position={3}
                                    totalWaiting={9}
                                    estimatedWaitMinutes={8}
                                    connectionState="connected"
                                    customerName="Marie"
                                />
                            </div>
                        </SubSection>

                        <SubSection title="CustomerWaitView — Called">
                            <div className="mx-auto max-w-sm rounded-lg border border-border-default p-6">
                                <CustomerWaitView
                                    status="called"
                                    position={0}
                                    totalWaiting={0}
                                    estimatedWaitMinutes={0}
                                    connectionState="connected"
                                    customerName="Marie"
                                />
                            </div>
                        </SubSection>

                        <SubSection title="CustomerWaitView — Offline">
                            <div className="mx-auto max-w-sm rounded-lg border border-border-default p-6">
                                <CustomerWaitView
                                    status="waiting"
                                    position={3}
                                    totalWaiting={9}
                                    estimatedWaitMinutes={8}
                                    connectionState="offline"
                                    customerName="Marie"
                                />
                            </div>
                        </SubSection>
                    </Section>

                    {/* ═══════════════════════ ORGANISMS — MARCHAND ═══════════════════════ */}
                    <Section
                        id="organisms-merchant"
                        title="Organisms — Côté Marchand"
                    >
                        <SubSection title="OnboardingForm">
                            <div className="max-w-lg">
                                <OnboardingForm
                                    onComplete={(data) =>
                                        alert(JSON.stringify(data, null, 2))
                                    }
                                    checkSlugAvailability={mockCheckSlug}
                                />
                            </div>
                        </SubSection>

                        <SubSection title="StatsPanel">
                            <StatsPanel
                                servedToday={42}
                                servedTrend="+12% vs hier"
                                avgWaitMinutes={8}
                                avgWaitTrend="-2 min"
                                abandonRate={5}
                                abandonTrend="Stable"
                                peakHour="12h"
                                hourlyData={mockHourlyData}
                            />
                        </SubSection>

                        <SubSection title="SettingsPanel">
                            <SettingsPanel
                                initialData={{
                                    merchantName: "Boulangerie Martin",
                                    slug: "boulangerie-martin",
                                    logoUrl: null,
                                    defaultPrepTimeMin: 5,
                                    maxCapacity: 20,
                                    welcomeMessage:
                                        "Bienvenue ! Prenez un numéro et profitez de votre temps libre.",
                                    notificationsEnabled: true,
                                    autoCloseEnabled: true,
                                }}
                            />
                        </SubSection>
                    </Section>

                    {/* ══════════════════════════════ AUTH ══════════════════════════════ */}
                    <Section id="auth" title="Auth — Connexion / Inscription">
                        {/* ── Atom: Divider ── */}
                        <SubSection title="Atom — Divider">
                            <div className="flex flex-col gap-4 max-w-sm">
                                <Divider />
                                <Divider label="ou" />
                                <Divider label="continuer avec" />
                            </div>
                        </SubSection>

                        {/* ── Molecule: PasswordInput ── */}
                        <SubSection title="Molecule — PasswordInput">
                            <div className="flex flex-col gap-4 max-w-sm">
                                <PasswordInput label="Mot de passe" />
                                <PasswordInput
                                    label="Mot de passe"
                                    error="Minimum 8 caractères requis."
                                />
                                <PasswordInput
                                    label="Mot de passe"
                                    hint="Minimum 8 caractères."
                                />
                            </div>
                        </SubSection>

                        {/* ── Molecule: AuthErrorBanner ── */}
                        <SubSection title="Molecule — AuthErrorBanner">
                            <div className="flex flex-col gap-3 max-w-sm">
                                <AuthErrorBanner message="Adresse e-mail ou mot de passe incorrect." />
                                <AuthErrorBanner message="Un compte avec cette adresse e-mail existe déjà." />
                            </div>
                        </SubSection>

                        {/* ── Molecule: SocialAuthButtons ── */}
                        <SubSection title="Molecule — SocialAuthButtons">
                            <div className="flex flex-wrap gap-8">
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-text-secondary">
                                        label “Continuer” (défaut)
                                    </p>
                                    <div className="w-72">
                                        <SocialAuthButtons
                                            onProvider={async () => {}}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-text-secondary">
                                        label “Se connecter”
                                    </p>
                                    <div className="w-72">
                                        <SocialAuthButtons
                                            label="Se connecter"
                                            onProvider={async () => {}}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-text-secondary">
                                        label “S’inscrire”
                                    </p>
                                    <div className="w-72">
                                        <SocialAuthButtons
                                            label="S'inscrire"
                                            onProvider={async () => {}}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-text-secondary">
                                        disabled
                                    </p>
                                    <div className="w-72">
                                        <SocialAuthButtons
                                            onProvider={async () => {}}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </SubSection>

                        {/* ── Organism: LoginForm ── */}
                        <SubSection title="Organism — LoginForm">
                            <div className="grid gap-8 sm:grid-cols-2">
                                <div>
                                    <p className="mb-3 text-xs text-text-secondary">
                                        Avec OAuth (Google + Apple)
                                    </p>
                                    <div className="rounded-lg border border-border-default bg-surface-card p-6">
                                        <LoginForm
                                            action={async () => ({
                                                data: null,
                                            })}
                                            socialAction={async () => ({
                                                data: { url: "" },
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs text-text-secondary">
                                        Avec erreur serveur
                                    </p>
                                    <div className="rounded-lg border border-border-default bg-surface-card p-6">
                                        <LoginForm
                                            action={async () => ({
                                                error: "Adresse e-mail ou mot de passe incorrect.",
                                            })}
                                            socialAction={async () => ({
                                                data: { url: "" },
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SubSection>

                        {/* ── Organism: RegisterForm ── */}
                        <SubSection title="Organism — RegisterForm">
                            <div className="grid gap-8 sm:grid-cols-2">
                                <div>
                                    <p className="mb-3 text-xs text-text-secondary">
                                        Avec OAuth (Google + Apple)
                                    </p>
                                    <div className="rounded-lg border border-border-default bg-surface-card p-6">
                                        <RegisterForm
                                            action={async () => ({
                                                data: null,
                                            })}
                                            socialAction={async () => ({
                                                data: { url: "" },
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs text-text-secondary">
                                        Avec erreur serveur
                                    </p>
                                    <div className="rounded-lg border border-border-default bg-surface-card p-6">
                                        <RegisterForm
                                            action={async () => ({
                                                error: "Un compte avec cette adresse existe déjà.",
                                            })}
                                            socialAction={async () => ({
                                                data: { url: "" },
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SubSection>

                        {/* ── Organism: ForgotPasswordForm ── */}
                        <SubSection title="Organism — ForgotPasswordForm">
                            <div className="grid gap-8 sm:grid-cols-2">
                                <div>
                                    <p className="mb-3 text-xs text-text-secondary">
                                        État initial
                                    </p>
                                    <div className="rounded-lg border border-border-default bg-surface-card p-6">
                                        <ForgotPasswordForm
                                            action={async () => ({
                                                data: null,
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs text-text-secondary">
                                        État succès (après soumission)
                                    </p>
                                    <div className="rounded-lg border border-border-default bg-surface-card p-6">
                                        <ForgotPasswordFormSuccess />
                                    </div>
                                </div>
                            </div>
                        </SubSection>

                        {/* ── Organism: ResetPasswordForm ── */}
                        <SubSection title="Organism — ResetPasswordForm">
                            <div className="max-w-sm">
                                <p className="mb-3 text-xs text-text-secondary">
                                    État initial
                                </p>
                                <div className="rounded-lg border border-border-default bg-surface-card p-6">
                                    <ResetPasswordForm
                                        action={async () => ({ data: null })}
                                    />
                                </div>
                            </div>
                        </SubSection>
                    </Section>

                    {/* ══════════════════════════════ NOTIFICATIONS ══════════════════════════════ */}
                    <Section id="notifications" title="Notifications client">
                        <p className="-mt-3 text-sm text-text-secondary">
                            Simulation des canaux d&apos;alerte&nbsp;: son (Web
                            Audio), vibration/Taptic, toast in-app et push OS.
                            Permissions demandées automatiquement à
                            l&apos;arrivée. Rappel automatique configurable
                            jusqu&apos;à acquittement du client. Préférences
                            marchand pour activer/désactiver chaque canal.
                        </p>
                        <NotificationSandbox customerName="Marie" />
                    </Section>
                </div>
            </main>
        </div>
    )
}
