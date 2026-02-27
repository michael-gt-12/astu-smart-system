import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { LoadingSkeleton, StatusBadge, PageHeader } from '../components/UI'
import {
    HiOutlineDocumentText, HiOutlineClock, HiOutlineCheckCircle,
    HiOutlinePlusCircle, HiOutlineExclamationCircle
} from 'react-icons/hi2'

function StudentDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['myComplaints'],
        queryFn: () => api.get('/complaints/my?limit=5').then(r => r.data.data),
    })

    if (isLoading) return <LoadingSkeleton count={3} />

    const complaints = data?.complaints || []
    const total = data?.pagination?.total || 0
    const open = complaints.filter(c => c.status === 'Open').length
    const inProgress = complaints.filter(c => c.status === 'In Progress').length
    const resolved = complaints.filter(c => c.status === 'Resolved').length

    return (
        <>
            <PageHeader title="Student Dashboard" subtitle="Track and manage your complaints" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={HiOutlineDocumentText} label="Total Complaints" value={total} color="primary" />
                <StatCard icon={HiOutlineExclamationCircle} label="Open" value={open} color="blue" />
                <StatCard icon={HiOutlineClock} label="In Progress" value={inProgress} color="amber" />
                <StatCard icon={HiOutlineCheckCircle} label="Resolved" value={resolved} color="emerald" />
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Complaints</h2>
                <Link to="/complaints/new" className="btn-primary flex items-center gap-2 text-sm">
                    <HiOutlinePlusCircle className="w-4 h-4" />
                    New Complaint
                </Link>
            </div>

            {complaints.length === 0 ? (
                <div className="card p-8 text-center">
                    <HiOutlineDocumentText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No complaints yet. Submit your first complaint!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map(complaint => (
                        <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="card-hover block p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{complaint.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{complaint.description}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-gray-400">{complaint.category?.name}</span>
                                        <span className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
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

function StaffDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['assignedComplaints'],
        queryFn: () => api.get('/complaints/assigned?limit=10').then(r => r.data.data),
    })

    if (isLoading) return <LoadingSkeleton count={3} />

    const complaints = data?.complaints || []
    const total = data?.pagination?.total || 0

    return (
        <>
            <PageHeader title="Staff Dashboard" subtitle="Manage assigned complaints" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard icon={HiOutlineDocumentText} label="Assigned to Me" value={total} color="primary" />
                <StatCard icon={HiOutlineClock} label="In Progress" value={complaints.filter(c => c.status === 'In Progress').length} color="amber" />
                <StatCard icon={HiOutlineCheckCircle} label="Resolved" value={complaints.filter(c => c.status === 'Resolved').length} color="emerald" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigned Complaints</h2>

            {complaints.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-gray-500">No complaints assigned to you yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map(complaint => (
                        <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="card-hover block p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{complaint.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">From: {complaint.studentId?.name}</p>
                                    <span className="text-xs text-gray-400">{complaint.category?.name} • {new Date(complaint.createdAt).toLocaleDateString()}</span>
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

function AdminDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['analytics'],
        queryFn: () => api.get('/analytics').then(r => r.data.data),
    })

    if (isLoading) return <LoadingSkeleton count={4} />

    return (
        <>
            <PageHeader title="Admin Dashboard" subtitle="System overview and statistics" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={HiOutlineDocumentText} label="Total Complaints" value={data?.totalComplaints || 0} color="primary" />
                <StatCard icon={HiOutlineExclamationCircle} label="Open" value={data?.open || 0} color="blue" />
                <StatCard icon={HiOutlineClock} label="In Progress" value={data?.inProgress || 0} color="amber" />
                <StatCard icon={HiOutlineCheckCircle} label="Resolution Rate" value={`${data?.resolutionRate || 0}%`} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link to="/complaints/all" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
                            <span className="text-sm font-medium">View All Complaints</span>
                        </Link>
                        <Link to="/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-medium">Analytics Dashboard</span>
                        </Link>
                        <Link to="/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <HiOutlineClock className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-medium">Manage Users</span>
                        </Link>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            📊 {data?.recentCount || 0} new complaints this week
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ✅ {data?.resolved || 0} complaints resolved total
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            📈 Resolution rate: {data?.resolutionRate || 0}%
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

function StatCard({ icon: Icon, label, value, color }) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    }

    return (
        <div className="card p-5">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const { user } = useAuth()

    if (user?.role === 'admin') return <AdminDashboard />
    if (user?.role === 'category_staff') return <StaffDashboard />
    return <StudentDashboard />
}
