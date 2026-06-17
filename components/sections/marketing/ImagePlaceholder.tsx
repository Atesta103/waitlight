import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type ImagePlaceholderProps = {
    label: string
    hint?: string
    className?: string
}

export function ImagePlaceholder({
    label,
    hint = "Ajoutez votre image ici",
    className,
}: ImagePlaceholderProps) {
    return (
        <div
            role="img"
            aria-label={label}
            className={cn(
                "flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center",
                className,
            )}
        >
            <div>
                <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                    <ImageIcon size={20} aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{hint}</p>
            </div>
        </div>
    )
}
