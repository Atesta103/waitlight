export default function DashboardLoading() {
    return (
        <div className="animate-pulse flex flex-col gap-6 p-6">
            <div className="h-8 w-56 rounded-lg bg-border-default" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="h-28 rounded-xl bg-border-default" />
                <div className="h-28 rounded-xl bg-border-default" />
                <div className="h-28 rounded-xl bg-border-default" />
            </div>
            <div className="h-64 rounded-xl bg-border-default" />
        </div>
    )
}
