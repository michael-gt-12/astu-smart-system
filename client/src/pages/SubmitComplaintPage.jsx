import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/UI'
import { HiOutlinePaperClip, HiOutlineArrowUpTray } from 'react-icons/hi2'

export default function SubmitComplaintPage() {
    const [form, setForm] = useState({ title: '', description: '', category: '' })
    const [file, setFile] = useState(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories').then(r => r.data.data),
    })

    const mutation = useMutation({
        mutationFn: async (formData) => {
            const res = await api.post('/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return res.data
        },
        onSuccess: () => {
            toast.success('Complaint submitted successfully!')
            queryClient.invalidateQueries({ queryKey: ['myComplaints'] })
            navigate('/complaints')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to submit complaint')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('description', form.description)
        formData.append('category', form.category)
        if (file) formData.append('file', file)
        mutation.mutate(formData)
    }

    const handleFileChange = (e) => {
        const f = e.target.files[0]
        if (f) {
            if (f.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB')
                return
            }
            setFile(f)
        }
    }

    return (
        <>
            <PageHeader title="Submit Complaint" subtitle="Describe your issue and we'll help resolve it" />

            <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-5">
                <div>
                    <label className="label">Title</label>
                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="input-field"
                        placeholder="Brief summary of your issue"
                        required
                        minLength={3}
                        maxLength={200}
                    />
                </div>

                <div>
                    <label className="label">Category</label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="input-field"
                        required
                    >
                        <option value="">Select a category</option>
                        {categoriesData?.categories?.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="input-field min-h-[150px] resize-y"
                        placeholder="Provide detailed information about your issue..."
                        required
                        minLength={10}
                        maxLength={5000}
                    />
                    <p className="text-xs text-gray-400 mt-1">{form.description.length}/5000 characters</p>
                </div>

                <div>
                    <label className="label">Attachment (Optional)</label>
                    <div className="relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.csv,.xlsx,.zip,.rar"
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
                        >
                            <HiOutlineArrowUpTray className="w-6 h-6 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {file ? file.name : 'Click to upload a file'}
                                </p>
                                <p className="text-xs text-gray-400">Max 10MB. No executable files.</p>
                            </div>
                        </label>
                    </div>
                    {file && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-primary-600">
                            <HiOutlinePaperClip className="w-4 h-4" />
                            <span>{file.name}</span>
                            <button type="button" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 ml-auto">Remove</button>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={mutation.isPending} className="btn-primary">
                        {mutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </span>
                        ) : 'Submit Complaint'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
                </div>
            </form>
        </>
    )
}
