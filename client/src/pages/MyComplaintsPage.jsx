import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { LoadingSkeleton, StatusBadge, PageHeader, EmptyState } from '../components/UI'
import { HiOutlineDocumentText } from 'react-icons/hi2'

export default function MyComplaintsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const status = searchParams.get('status') || ''

    const { data, isLoading } = useQuery({
        queryKey: ['myComplaints', status],
        queryFn: () => api.get(`/complaints/my?status=${status}&limit=50`).then(r => r.data.data),
    })

    const handleFilter = (s) => {
        if (s) setSearchParams({ status: s })
        else setSearchParams({})
    }

    if (isLoading) return <LoadingSkeleton count={4} />

    const complaints = data?.complaints || []

    return (
        <>
            <PageHeader
                title="My Complaints"
                subtitle={`${data?.pagination?.total || 0} total complaints`}
                action={
                    <Link to="/complaints/new" className="btn-primary text-sm">+ New Complaint</Link>
                }
            />

            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['', 'Open', 'In Progress', 'Resolved'].map((s) => (
                    <button
                        key={s}
                        onClick={() => handleFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {complaints.length === 0 ? (
                <EmptyState
                    icon={HiOutlineDocumentText}
                    title="No complaints found"
                    description={status ? `No ${status.toLowerCase()} complaints.` : 'You haven\'t submitted any complaints yet.'}
                    action={<Link to="/complaints/new" className="btn-primary text-sm">Submit Complaint</Link>}
                />
            ) : (
                <div className="space-y-3">
                    {complaints.map(complaint => (
                        <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="card-hover block p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{complaint.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{complaint.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span>{complaint.category?.name}</span>
                                        <span>•</span>
                                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        {complaint.assignedStaffId && (
                                            <>
                                                <span>•</span>
                                                <span>Assigned to: {complaint.assignedStaffId.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <StatusBadge status={complaint.status} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}
