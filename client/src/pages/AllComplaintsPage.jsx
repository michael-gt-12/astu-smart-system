import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { LoadingSkeleton, StatusBadge, PageHeader, EmptyState } from '../components/UI'
import { HiOutlineDocumentText } from 'react-icons/hi2'

export default function AllComplaintsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const status = searchParams.get('status') || ''

    const { data, isLoading } = useQuery({
        queryKey: ['allComplaints', status],
        queryFn: () => api.get(`/complaints/all?status=${status}&limit=50`).then(r => r.data.data),
    })

    if (isLoading) return <LoadingSkeleton count={5} type="table" />

    const complaints = data?.complaints || []

    return (
        <>
            <PageHeader title="All Complaints" subtitle={`${data?.pagination?.total || 0} total`} />

            <div className="flex gap-2 mb-6 flex-wrap">
                {['', 'Open', 'In Progress', 'Pending Student Verification', 'Resolved'].map((s) => (
                    <button
                        key={s}
                        onClick={() => s ? setSearchParams({ status: s }) : setSearchParams({})}
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
                <EmptyState icon={HiOutlineDocumentText} title="No complaints found" />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Title</th>
                                    <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Category</th>
                                    <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Student</th>
                                    <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map(c => (
                                    <tr key={c._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3">
                                            <Link to={`/complaints/${c._id}`} className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">{c.title}</Link>
                                        </td>
                                        <td className="p-3 text-gray-500 dark:text-gray-400">{c.category?.name}</td>
                                        <td className="p-3 text-gray-500 dark:text-gray-400">{c.studentId?.name}</td>
                                        <td className="p-3"><StatusBadge status={c.status} /></td>
                                        <td className="p-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    )
}
