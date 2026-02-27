import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'
import { LoadingSkeleton, PageHeader } from '../components/UI'
import toast from 'react-hot-toast'
import { HiOutlineTrash, HiOutlinePencil, HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2'

export default function CategoriesPage() {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState({ name: '', description: '' })

    const { data, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories').then(r => r.data.data),
    })

    const createMutation = useMutation({
        mutationFn: (catData) => api.post('/categories', catData),
        onSuccess: () => {
            toast.success('Category created')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            resetForm()
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, ...catData }) => api.put(`/categories/${id}`, catData),
        onSuccess: () => {
            toast.success('Category updated')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            resetForm()
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        onSuccess: () => {
            toast.success('Category deleted')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
    })

    const resetForm = () => {
        setShowForm(false)
        setEditId(null)
        setForm({ name: '', description: '' })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editId) {
            updateMutation.mutate({ id: editId, ...form })
        } else {
            createMutation.mutate(form)
        }
    }

    const startEdit = (cat) => {
        setEditId(cat._id)
        setForm({ name: cat.name, description: cat.description || '' })
        setShowForm(true)
    }

    if (isLoading) return <LoadingSkeleton count={4} />

    const categories = data?.categories || []

    return (
        <>
            <PageHeader
                title="Categories"
                subtitle={`${categories.length} categories`}
                action={
                    <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn-primary flex items-center gap-2 text-sm">
                        {showForm ? <><HiOutlineXMark className="w-4 h-4" /> Cancel</> : <><HiOutlinePlus className="w-4 h-4" /> Add Category</>}
                    </button>
                }
            />

            {showForm && (
                <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {editId ? 'Edit Category' : 'New Category'}
                    </h3>
                    <div>
                        <label className="label">Name</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary text-sm">
                            {editId ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </form>
            )}

            <div className="grid gap-3 md:grid-cols-2">
                {categories.map(cat => (
                    <div key={cat._id} className="card p-4 flex items-start justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{cat.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cat.description || 'No description'}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => startEdit(cat)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { if (confirm('Delete this category?')) deleteMutation.mutate(cat._id) }}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                            >
                                <HiOutlineTrash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
