import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { LoadingSkeleton, PageHeader } from '../components/UI'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineClock, HiOutlineChartBar } from 'react-icons/hi2'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#7c3aed', '#4f46e5']

export default function AnalyticsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['analytics'],
        queryFn: () => api.get('/analytics').then(r => r.data.data),
    })

    if (isLoading) return <LoadingSkeleton count={4} />

    const chartData = data?.categoryStats || []

    return (
        <>
            <PageHeader title="Analytics Dashboard" subtitle="Overview of complaint statistics and trends" />

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                            <HiOutlineDocumentText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.totalComplaints || 0}</p>
                            <p className="text-sm text-gray-500">Total Complaints</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.resolutionRate || 0}%</p>
                            <p className="text-sm text-gray-500">Resolution Rate</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <HiOutlineClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.inProgress || 0}</p>
                            <p className="text-sm text-gray-500">In Progress</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <HiOutlineChartBar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.recentCount || 0}</p>
                            <p className="text-sm text-gray-500">This Week</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bar chart */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Complaints per Category</h3>
                {chartData.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No data available yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                interval={0}
                                height={80}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#f9fafb',
                                    fontSize: '13px',
                                }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                {chartData.map((_, index) => (
                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </>
    )
}
