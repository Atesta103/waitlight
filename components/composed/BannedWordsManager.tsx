"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import { Plus, X, Search, ShieldAlert, Loader2 } from "lucide-react"
import {
    getBannedWordsAction,
    addBannedWordAction,
    removeBannedWordAction,
    type BannedWord,
} from "@/lib/actions/settings"

type BannedWordsManagerProps = {
    className?: string
}

/**
 * Composed — full CRUD UI for managing a merchant's banned words list.
 * Integrates into SettingsPanel as a collapsible section.
 */
function BannedWordsManager({ className }: BannedWordsManagerProps) {
    const [words, setWords] = useState<BannedWord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newWord, setNewWord] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        let active = true

        void (async () => {
            const result = await getBannedWordsAction()
            if (!active) return

            if ("data" in result) {
                setWords(result.data)
            } else {
                setError(result.error)
            }

            setIsLoading(false)
        })()

        return () => {
            active = false
        }
    }, [])

    async function handleAdd() {
        const trimmed = newWord.trim()
        if (!trimmed) return

        setIsAdding(true)
        setError(null)

        const result = await addBannedWordAction(trimmed)

        if ("data" in result) {
            setWords((prev) => [result.data, ...prev])
            setNewWord("")
        } else {
            setError(result.error)
        }

        setIsAdding(false)
    }

    async function handleRemove(wordId: string) {
        setRemovingIds((prev) => new Set(prev).add(wordId))
        setError(null)

        const result = await removeBannedWordAction(wordId)

        if ("data" in result) {
            setWords((prev) => prev.filter((w) => w.id !== wordId))
        } else {
            setError(result.error)
        }

        setRemovingIds((prev) => {
            const next = new Set(prev)
            next.delete(wordId)
            return next
        })
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAdd()
        }
    }

    const filteredWords = searchQuery
        ? words.filter((w) =>
              w.word.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : words

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div className="rounded-2xl border border-border-default bg-surface-base/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <Input
                        label="Nouveau mot"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ajouter un mot…"
                        className="flex-1 [&>label]:sr-only"
                        maxLength={50}
                    />
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAdd}
                        disabled={isAdding || !newWord.trim()}
                        isLoading={isAdding}
                        className="shrink-0"
                    >
                        <Plus size={16} aria-hidden="true" />
                        <span>Ajouter</span>
                    </Button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-feedback-error/25 bg-feedback-error-bg px-3 py-2.5 text-xs text-feedback-error">
                    <ShieldAlert size={14} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Search filter */}
            {words.length > 5 && (
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                        aria-hidden="true"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher…"
                        className="w-full rounded-xl border border-border-default bg-surface-base py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
            )}

            {/* Word list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-text-secondary" />
                </div>
            ) : filteredWords.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl border border-dashed border-border-default bg-surface-base/50">
                    <ShieldAlert size={28} className="text-text-secondary opacity-50" />
                    <p className="text-sm text-text-secondary max-w-sm">
                        {words.length === 0
                            ? "Aucun mot banni. Les prénoms offensants ou noms inappropriés bloqués apparaîtront ici."
                            : "Aucun résultat pour cette recherche."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2.5">
                    {filteredWords.map((word) => (
                        <div
                            key={word.id}
                            className={cn(
                                "group flex items-center gap-2 rounded-full border border-border-default bg-surface-card px-3 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-all hover:border-brand-primary/30 hover:bg-brand-primary/5",
                                removingIds.has(word.id) && "opacity-50 scale-95",
                            )}
                        >
                            <span>{word.word}</span>
                            <button
                                onClick={() => handleRemove(word.id)}
                                disabled={removingIds.has(word.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-text-secondary transition-colors group-hover:bg-feedback-error-bg group-hover:text-feedback-error hover:bg-feedback-error-bg"
                                aria-label={`Supprimer "${word.word}"`}
                            >
                                {removingIds.has(word.id) ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <X size={12} strokeWidth={2.5} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Word count */}
            {words.length > 0 && (
                <p className="text-xs text-text-secondary">
                    {words.length} mot{words.length > 1 ? "s" : ""} banni
                    {words.length > 1 ? "s" : ""}
                </p>
            )}
        </div>
    )
}

export { BannedWordsManager, type BannedWordsManagerProps }
