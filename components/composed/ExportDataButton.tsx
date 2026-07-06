"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { exportMerchantDataAction } from "@/lib/actions/export"

export function ExportDataButton() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleExport() {
        setIsPending(true)
        setError(null)

        const result = await exportMerchantDataAction()

        if ("error" in result) {
            setError(result.error)
            setIsPending(false)
            return
        }

        const json = JSON.stringify(result.data, null, 2)
        const blob = new Blob([json], { type: "application/json;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const date = new Date().toISOString().slice(0, 10)
        const a = document.createElement("a")
        a.href = url
        a.download = `waitlight-export-${date}.json`
        a.click()
        URL.revokeObjectURL(url)

        setIsPending(false)
    }

    return (
        <div className="flex flex-col gap-2">
            <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                isLoading={isPending}
                className="w-fit"
            >
                <Download size={15} className="mr-2" aria-hidden />
                Télécharger mes données
            </Button>
            {error ? (
                <p role="alert" className="text-sm text-feedback-error">
                    {error}
                </p>
            ) : null}
        </div>
    )
}
