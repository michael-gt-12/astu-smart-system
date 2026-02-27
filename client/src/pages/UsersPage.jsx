import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'
import { LoadingSkeleton, PageHeader } from '../components/UI'
import toast from 'react-hot-toast'
import { HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi2'

export default function UsersPage() {
    const queryClient = useQueryClient()
    const [editingUser, setEditingUser] = useState(null)
    const [editRole, setEditRole] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => api.get('/users?limit=100').then(r => r.data.data),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, role }) => api.put(`/users/${id}`, { role }),
        onSuccess: () => {
            toast.success('User updated')
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setEditingUser(null)
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/users/${id}`),
        onSuccess: () => {
            toast.success('User deleted')
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
    })

    if (isLoading) return <LoadingSkeleton count={5} type="table" />

    const users = data?.users || []

    const roleColors = {
        admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        category_staff: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }

    return (
        <>
            <PageHeader title="Manage Users" subtitle={`${data?.pagination?.total || 0} total users`} />

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                                <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                                <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                                <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} className="border-b border-gray-100 dark:border-dark-border">
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                                    <td className="p-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                                    <td className="p-3">
                                        {editingUser === u._id ? (
                                            <div className="flex items-center gap-2">
                                                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="input-field py-1 text-xs w-24">
                                                    <option value="student">Student</option>
                                                    <option value="category_staff">Staff</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button onClick={() => updateMutation.mutate({ id: u._id, role: editRole })} className="text-xs text-primary-600 font-medium">Save</button>
                                                <button onClick={() => setEditingUser(null)} className="text-xs text-gray-500">Cancel</button>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                                {u.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { setEditingUser(u._id); setEditRole(u.role) }}
                                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                                title="Edit role"
                                            >
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this user?')) {
                                                        deleteMutation.mutate(u._id)
                                                    }
                                                }}
                                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                                title="Delete user"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
