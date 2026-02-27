export function LoadingSkeleton({ count = 3, type = 'card' }) {
    if (type === 'table') {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 card">
                        <div className="skeleton h-4 w-1/4 rounded" />
                        <div className="skeleton h-4 w-1/3 rounded" />
                        <div className="skeleton h-4 w-1/6 rounded" />
                        <div className="skeleton h-4 w-1/6 rounded" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card p-6 space-y-4">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="flex justify-between">
                        <div className="skeleton h-6 w-20 rounded-full" />
                        <div className="skeleton h-4 w-16 rounded" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function StatusBadge({ status }) {
    const className = status === 'Resolved' ? 'status-resolved'
        : status === 'In Progress' ? 'status-in-progress'
            : status === 'Pending Student Verification' ? 'status-pending-verification'
                : 'status-open'

    return <span className={className}>{status}</span>
}

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {Icon && <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />}
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
            {description && <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 max-w-md">{description}</p>}
            {action}
        </div>
    )
}

export function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    )
}
