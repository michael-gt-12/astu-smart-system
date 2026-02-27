import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { LoadingSkeleton, StatusBadge, PageHeader } from '../components/UI'
import toast from 'react-hot-toast'
import { HiOutlinePaperClip, HiOutlineArrowLeft } from 'react-icons/hi2'

export default function ComplaintDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['complaint', id],
        queryFn: () => api.get(`/complaints/${id}`).then(r => r.data.data.complaint),
    })

    const [status, setStatus] = useState('')
    const [remarks, setRemarks] = useState('')

    const { data: summaryData, refetch: fetchSummary, isFetching: summaryLoading } = useQuery({
        queryKey: ['complaintSummary', id],
        queryFn: () => api.get(`/complaints/${id}/summary`).then(r => r.data.data.summary),
        enabled: false,
    })

    const updateMutation = useMutation({
        mutationFn: (updateData) => api.patch(`/complaints/${id}/status`, updateData).then(r => r.data),
        onSuccess: () => {
            toast.success('Complaint updated successfully!')
            queryClient.invalidateQueries({ queryKey: ['complaint', id] })
            queryClient.invalidateQueries({ queryKey: ['myComplaints'] })
            queryClient.invalidateQueries({ queryKey: ['assignedComplaints'] })
            queryClient.invalidateQueries({ queryKey: ['allComplaints'] })
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
    })

    const confirmMutation = useMutation({
        mutationFn: () => api.post(`/complaints/${id}/confirm`).then(r => r.data),
        onSuccess: () => {
            toast.success('Thank you! Complaint marked as resolved.')
            queryClient.invalidateQueries({ queryKey: ['complaint', id] })
            queryClient.invalidateQueries({ queryKey: ['myComplaints'] })
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Confirmation failed'),
    })

    const handleUpdate = () => {
        const updateData = {}
        if (status) updateData.status = status
        if (remarks) updateData.remarks = remarks
        if (Object.keys(updateData).length === 0) return toast.error('No changes to update')
        updateMutation.mutate(updateData)
    }

    if (isLoading) return <LoadingSkeleton count={1} />

    if (!data) return <div className="card p-8 text-center text-gray-500">Complaint not found.</div>

    const isOwner = user?.id === data.studentId?._id
    const canUpdate = user?.role === 'admin' || user?.role === 'category_staff'
    const isPendingVerification = data.status === 'Pending Student Verification'

    return (
        <>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4">
                <HiOutlineArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{data.title}</h1>
                            <StatusBadge status={data.status} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{data.description}</p>

                        {data.fileUrl && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <a href={data.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    <HiOutlinePaperClip className="w-4 h-4" />
                                    View Attached File
                                </a>
                            </div>
                        )}

                        {data.remarks && (
                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Staff Remarks</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300">{data.remarks}</p>
                            </div>
                        )}

                        {/* Student Confirmation Button */}
                        {isOwner && isPendingVerification && (
                            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-lg">
                                <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-300 mb-2">Work Completed</h4>
                                <p className="text-sm text-primary-700 dark:text-primary-400 mb-4">
                                    The staff has marked this issue as completed. Please confirm if the solution is satisfactory.
                                </p>
                                <button
                                    onClick={() => confirmMutation.mutate()}
                                    disabled={confirmMutation.isPending}
                                    className="btn-primary w-full sm:w-auto"
                                >
                                    {confirmMutation.isPending ? 'Processing...' : 'Confirm & Resolve'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* AI Summary for Admin */}
                    {user?.role === 'admin' && (
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white">🤖 AI Summary</h3>
                                <button onClick={() => fetchSummary()} disabled={summaryLoading} className="btn-secondary text-sm">
                                    {summaryLoading ? 'Generating...' : 'Generate Summary'}
                                </button>
                            </div>
                            {summaryData && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{summaryData}</p>
                            )}
                        </div>
                    )}

                    {/* Update form for staff/admin */}
                    {canUpdate && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Update Complaint</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Status</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                                        <option value="">Keep current ({data.status})</option>
                                        <option value="In Progress">Move to: In Progress</option>
                                        <option value="Pending Student Verification">Move to: Pending Student Verification</option>
                                        {user?.role === 'admin' && <option value="Resolved">Force Resolve (Admin)</option>}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Remarks</label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="input-field min-h-[80px]"
                                        placeholder="Add remarks or notes..."
                                    />
                                </div>

                                <button onClick={handleUpdate} disabled={updateMutation.isPending} className="btn-primary">
                                    {updateMutation.isPending ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar info */}
                <div className="space-y-4">
                    <div className="card p-5">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Details</h3>
                        <dl className="space-y-3 text-sm">
                            <div><dt className="text-gray-500 dark:text-gray-400">Category</dt><dd className="font-medium mt-0.5">{data.category?.name}</dd></div>
                            <div><dt className="text-gray-500 dark:text-gray-400">Submitted by</dt><dd className="font-medium mt-0.5">{data.studentId?.name}<br /><span className="text-xs text-gray-400">{data.studentId?.email}</span></dd></div>
                            <div><dt className="text-gray-500 dark:text-gray-400">Created</dt><dd className="font-medium mt-0.5">{new Date(data.createdAt).toLocaleString()}</dd></div>
                            <div><dt className="text-gray-500 dark:text-gray-400">Last Updated</dt><dd className="font-medium mt-0.5">{new Date(data.updatedAt).toLocaleString()}</dd></div>
                        </dl>
                    </div>
                </div>
            </div>
        </>
    )
}
