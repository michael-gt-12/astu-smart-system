import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { LoadingSkeleton, StatusBadge, PageHeader, EmptyState } from '../components/UI'
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2'

export default function AssignedComplaintsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['assignedComplaints'],
        queryFn: () => api.get('/complaints/assigned?limit=50').then(r => r.data.data),
    })

    if (isLoading) return <LoadingSkeleton count={5} type="table" />

    const complaints = data?.complaints || []

    return (
        <>
            <PageHeader title="Assigned Complaints" subtitle={`${data?.pagination?.total || 0} complaints assigned to you`} />

            {complaints.length === 0 ? (
                <EmptyState icon={HiOutlineClipboardDocumentList} title="No assigned complaints" description="No complaints have been assigned to you yet." />
            ) : (
                <div className="space-y-3">
                    {complaints.map(c => (
                        <Link key={c._id} to={`/complaints/${c._id}`} className="card-hover block p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{c.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{c.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span>From: {c.studentId?.name}</span>
                                        <span>•</span>
                                        <span>{c.category?.name}</span>
                                        <span>•</span>
                                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <StatusBadge status={c.status} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}
