export default function AnalyticsLoading() {
    return (
        <div className="animate-pulse flex flex-col gap-6 p-6">
            <div className="h-8 w-40 rounded-lg bg-border-default" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="h-24 rounded-xl bg-border-default" />
                <div className="h-24 rounded-xl bg-border-default" />
            </div>
            <div className="h-72 rounded-xl bg-border-default" />
            <div className="h-48 rounded-xl bg-border-default" />
        </div>
    )
}
