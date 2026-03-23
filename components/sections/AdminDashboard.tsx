"use client"

import { useState } from "react"
import type Stripe from "stripe"
import { Users, CreditCard, FileText, ExternalLink } from "lucide-react"
import { STATUS_LABELS } from "@/lib/subscription-status"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Merchant = {
    id: string
    name: string
    slug: string
    created_at: string
}

type SubscriptionRow = {
    merchant_id: string
    stripe_customer_id: string
    stripe_subscription_id: string | null
    status: string
    trial_end: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    created_at: string
}

type Props = {
    merchants: Merchant[]
    subscriptions: SubscriptionRow[]
    charges: Stripe.Charge[]
    invoices: Stripe.Invoice[]
    customerToMerchant: Record<string, string>
}

type Tab = "clients" | "payments" | "invoices"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null | undefined) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function formatAmount(amount: number | null, currency: string | null) {
    if (amount === null) return "—"
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: (currency ?? "eur").toUpperCase(),
    }).format(amount / 100)
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        active: "bg-feedback-success/15 text-feedback-success",
        trialing: "bg-status-called/15 text-status-called",
        past_due: "bg-status-waiting/15 text-status-waiting",
        canceled: "bg-surface-card text-text-secondary border border-border-default",
        incomplete: "bg-surface-card text-text-secondary border border-border-default",
        incomplete_expired: "bg-surface-card text-text-secondary border border-border-default",
        unpaid: "bg-feedback-error/15 text-feedback-error",
    }
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-surface-card text-text-secondary"}`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminDashboard({
    merchants,
    subscriptions,
    charges,
    invoices,
    customerToMerchant,
}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("clients")

    const subByMerchant = Object.fromEntries(
        subscriptions.map((s) => [s.merchant_id, s]),
    )

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "clients", label: "Clients", icon: <Users size={15} aria-hidden="true" /> },
        { id: "payments", label: "Paiements", icon: <CreditCard size={15} aria-hidden="true" /> },
        { id: "invoices", label: "Factures", icon: <FileText size={15} aria-hidden="true" /> },
    ]

    // Summary stats
    const activeCount = subscriptions.filter(
        (s) => s.status === "active" || s.status === "trialing",
    ).length
    const mrr = subscriptions
        .filter((s) => s.status === "active")
        .length * 29 // assuming €29/month flat rate

    return (
        <div className="min-h-screen bg-surface-base">
            <header className="border-b border-border-default bg-surface-card px-6 py-4">
                <h1 className="text-xl font-bold text-text-primary">
                    Administration — Wait-Light
                </h1>
                <p className="mt-0.5 text-sm text-text-secondary">
                    Gestion des clients, paiements et factures
                </p>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-6">
                {/* Summary cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Marchands", value: merchants.length },
                        { label: "Abonnements actifs", value: activeCount },
                        {
                            label: "MRR estimé",
                            value: `${mrr} €`,
                        },
                        {
                            label: "Factures (30 j)",
                            value: invoices.filter(
                                (i) =>
                                    i.created >
                                    Date.now() / 1000 - 30 * 86400,
                            ).length,
                        },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className="rounded-xl border border-border-default bg-surface-card p-4"
                        >
                            <p className="text-xs text-text-secondary">
                                {label}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-text-primary">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div
                    role="tablist"
                    aria-label="Sections admin"
                    className="mb-4 flex gap-1 rounded-lg border border-border-default bg-surface-card p-1 w-fit"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                                activeTab === tab.id
                                    ? "bg-brand-primary text-white"
                                    : "text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Clients tab */}
                {activeTab === "clients" && (
                    <section
                        id="panel-clients"
                        role="tabpanel"
                        aria-labelledby="tab-clients"
                    >
                        <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-base">
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Marchand
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Slug
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Statut
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Fin d&apos;essai
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Prochain débit
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Inscrit le
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default">
                                    {merchants.map((m) => {
                                        const sub = subByMerchant[m.id]
                                        return (
                                            <tr
                                                key={m.id}
                                                className="hover:bg-surface-base"
                                            >
                                                <td className="px-4 py-3 font-medium text-text-primary">
                                                    {m.name}
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary">
                                                    {m.slug}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {sub ? (
                                                        <StatusBadge
                                                            status={sub.status}
                                                        />
                                                    ) : (
                                                        <span className="text-text-secondary">
                                                            Aucun
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary">
                                                    {formatDate(sub?.trial_end)}
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary">
                                                    {formatDate(
                                                        sub?.current_period_end,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary">
                                                    {formatDate(m.created_at)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {merchants.length === 0 && (
                                <p className="py-8 text-center text-sm text-text-secondary">
                                    Aucun marchand enregistré.
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Payments tab */}
                {activeTab === "payments" && (
                    <section
                        id="panel-payments"
                        role="tabpanel"
                        aria-labelledby="tab-payments"
                    >
                        <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-base">
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Marchand
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Montant
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Statut
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            ID Stripe
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default">
                                    {charges.map((charge) => {
                                        const customerId =
                                            typeof charge.customer === "string"
                                                ? charge.customer
                                                : charge.customer?.id ?? ""
                                        const merchantName =
                                            customerToMerchant[customerId] ??
                                            customerId
                                        return (
                                            <tr
                                                key={charge.id}
                                                className="hover:bg-surface-base"
                                            >
                                                <td className="px-4 py-3 font-medium text-text-primary">
                                                    {merchantName}
                                                </td>
                                                <td className="px-4 py-3 text-text-primary">
                                                    {formatAmount(
                                                        charge.amount,
                                                        charge.currency,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            charge.status ===
                                                            "succeeded"
                                                                ? "bg-feedback-success/15 text-feedback-success"
                                                                : "bg-feedback-error/15 text-feedback-error"
                                                        }`}
                                                    >
                                                        {charge.status ===
                                                        "succeeded"
                                                            ? "Réussi"
                                                            : "Échoué"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary">
                                                    {formatDate(
                                                        new Date(
                                                            charge.created *
                                                                1000,
                                                        ).toISOString(),
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                                                    {charge.id}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {charges.length === 0 && (
                                <p className="py-8 text-center text-sm text-text-secondary">
                                    Aucun paiement trouvé.
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Invoices tab */}
                {activeTab === "invoices" && (
                    <section
                        id="panel-invoices"
                        role="tabpanel"
                        aria-labelledby="tab-invoices"
                    >
                        <div className="overflow-hidden rounded-xl border border-border-default bg-surface-card">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-default bg-surface-base">
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Marchand
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            N° Facture
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Montant
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Statut
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            Période
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-text-secondary">
                                            PDF
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default">
                                    {invoices.map((invoice) => {
                                        const customerId =
                                            typeof invoice.customer === "string"
                                                ? invoice.customer
                                                : invoice.customer?.id ?? ""
                                        const merchantName =
                                            customerToMerchant[customerId] ??
                                            customerId
                                        return (
                                            <tr
                                                key={invoice.id}
                                                className="hover:bg-surface-base"
                                            >
                                                <td className="px-4 py-3 font-medium text-text-primary">
                                                    {merchantName}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                                                    {invoice.number ?? "—"}
                                                </td>
                                                <td className="px-4 py-3 text-text-primary">
                                                    {formatAmount(
                                                        invoice.amount_due,
                                                        invoice.currency,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            invoice.status ===
                                                            "paid"
                                                                ? "bg-feedback-success/15 text-feedback-success"
                                                                : invoice.status ===
                                                                    "open"
                                                                  ? "bg-status-waiting/15 text-status-waiting"
                                                                  : "bg-surface-card text-text-secondary border border-border-default"
                                                        }`}
                                                    >
                                                        {invoice.status ===
                                                        "paid"
                                                            ? "Payée"
                                                            : invoice.status ===
                                                                "open"
                                                              ? "En attente"
                                                              : (invoice.status ?? "—")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary">
                                                    {invoice.period_start
                                                        ? `${formatDate(new Date(invoice.period_start * 1000).toISOString())} → ${formatDate(new Date(invoice.period_end * 1000).toISOString())}`
                                                        : "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {invoice.hosted_invoice_url ? (
                                                        <a
                                                            href={
                                                                invoice.hosted_invoice_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                                        >
                                                            Voir
                                                            <ExternalLink
                                                                size={12}
                                                                aria-hidden="true"
                                                            />
                                                        </a>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {invoices.length === 0 && (
                                <p className="py-8 text-center text-sm text-text-secondary">
                                    Aucune facture trouvée.
                                </p>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
