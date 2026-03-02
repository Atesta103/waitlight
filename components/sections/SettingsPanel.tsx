"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"
import { CapacityIndicator } from "@/components/composed/CapacityIndicator"
import { cn } from "@/lib/utils/cn"
import { Save, RotateCcw, Settings, QrCode, Bell } from "lucide-react"

type SettingsData = {
    merchantName: string
    slug: string
    maxCapacity: number
    welcomeMessage: string
    notificationsEnabled: boolean
    autoCloseEnabled: boolean
}

type SettingsPanelProps = {
    initialData: SettingsData
    currentWaiting?: number
    onSave?: (data: SettingsData) => void
    onRegenerateQR?: () => void
    isSaving?: boolean
    className?: string
}

function SettingsPanel({
    initialData,
    currentWaiting = 0,
    onSave,
    onRegenerateQR,
    isSaving = false,
    className,
}: SettingsPanelProps) {
    const [data, setData] = useState<SettingsData>(initialData)
    const [hasChanges, setHasChanges] = useState(false)

    const update = <K extends keyof SettingsData>(
        key: K,
        value: SettingsData[K],
    ) => {
        setData((d) => ({ ...d, [key]: value }))
        setHasChanges(true)
    }

    const handleSave = () => {
        onSave?.(data)
        setHasChanges(false)
    }

    const handleReset = () => {
        setData(initialData)
        setHasChanges(false)
    }

    return (
        <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
            {/* Left column — QR & capacity */}
            <div className="flex flex-col gap-6">
                {/* QR Code */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <QrCode
                                size={18}
                                className="text-text-secondary"
                                aria-hidden="true"
                            />
                            <span className="font-medium text-text-primary">
                                QR Code
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRegenerateQR}
                        >
                            <RotateCcw size={14} aria-hidden="true" />
                            Régénérer
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <QRCodeDisplay slug={data.slug} />
                    </CardContent>
                </Card>

                {/* Capacity */}
                <CapacityIndicator
                    current={currentWaiting}
                    max={data.maxCapacity}
                />
            </div>

            {/* Right column — settings form */}
            <div className="flex flex-col gap-6">
                {/* General settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings
                                size={18}
                                className="text-text-secondary"
                                aria-hidden="true"
                            />
                            <span className="font-medium text-text-primary">
                                Paramètres généraux
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Nom du commerce"
                                value={data.merchantName}
                                onChange={(e) =>
                                    update("merchantName", e.target.value)
                                }
                            />
                            <Input
                                label="Capacité maximale"
                                type="number"
                                min={1}
                                max={500}
                                value={data.maxCapacity}
                                onChange={(e) =>
                                    update(
                                        "maxCapacity",
                                        Number(e.target.value),
                                    )
                                }
                                hint="Nombre maximum de personnes dans la file."
                            />
                            <Textarea
                                label="Message d'accueil"
                                value={data.welcomeMessage}
                                onChange={(e) =>
                                    update("welcomeMessage", e.target.value)
                                }
                                hint="Affiché lors du scan du QR code."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notification settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell
                                size={18}
                                className="text-text-secondary"
                                aria-hidden="true"
                            />
                            <span className="font-medium text-text-primary">
                                Notifications
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <Toggle
                                checked={data.notificationsEnabled}
                                onChange={(v) =>
                                    update("notificationsEnabled", v)
                                }
                                label="Activer les notifications push"
                            />
                            <Toggle
                                checked={data.autoCloseEnabled}
                                onChange={(v) => update("autoCloseEnabled", v)}
                                label="Fermeture automatique après 5 min"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save / Reset */}
                {hasChanges ? (
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            isLoading={isSaving}
                            className="flex-1"
                        >
                            <Save size={16} aria-hidden="true" />
                            Enregistrer
                        </Button>
                        <Button variant="ghost" onClick={handleReset}>
                            Annuler
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export { SettingsPanel, type SettingsPanelProps, type SettingsData }
