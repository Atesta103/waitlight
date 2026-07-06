export default function SettingsLoading() {
    return (
        <div className="animate-pulse flex flex-col gap-6 p-6">
            {/* Page header */}
            <div className="h-8 w-48 rounded-lg bg-border-default" />

            {/* Section 1 */}
            <div className="flex flex-col gap-3">
                <div className="h-4 w-32 rounded bg-border-default" />
                <div className="h-10 rounded-lg bg-border-default" />
                <div className="h-10 rounded-lg bg-border-default" />
            </div>

            {/* Section 2 */}
            <div className="flex flex-col gap-3">
                <div className="h-4 w-32 rounded bg-border-default" />
                <div className="h-10 rounded-lg bg-border-default" />
                <div className="h-10 rounded-lg bg-border-default" />
            </div>

            {/* Section 3 */}
            <div className="flex flex-col gap-3">
                <div className="h-4 w-32 rounded bg-border-default" />
                <div className="h-10 rounded-lg bg-border-default" />
                <div className="h-10 rounded-lg bg-border-default" />
            </div>

            {/* Submit button — right-aligned */}
            <div className="flex justify-end">
                <div className="h-10 w-36 rounded-lg bg-border-default" />
            </div>
        </div>
    )
}
