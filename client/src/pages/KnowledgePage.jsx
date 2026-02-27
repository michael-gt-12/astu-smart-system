import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/UI'
import toast from 'react-hot-toast'
import { HiOutlineDocumentText, HiOutlineArrowUpTray, HiOutlineTrash, HiOutlineInformationCircle } from 'react-icons/hi2'

export default function KnowledgePage() {
    const queryClient = useQueryClient()
    const [file, setFile] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['knowledgeDocs'],
        queryFn: () => api.get('/knowledge').then(r => r.data.data.documents),
    })

    const uploadMutation = useMutation({
        mutationFn: (formData) => api.post('/knowledge', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: () => {
            toast.success('Document uploaded and indexed!')
            queryClient.invalidateQueries({ queryKey: ['knowledgeDocs'] })
            setFile(null)
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Upload failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/knowledge/${id}`),
        onSuccess: () => {
            toast.success('Document deleted')
            queryClient.invalidateQueries({ queryKey: ['knowledgeDocs'] })
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
    })

    const handleFileChange = (e) => {
        const f = e.target.files[0]
        if (f) {
            if (f.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed')
                return
            }
            setFile(f)
        }
    }

    const handleUpload = (e) => {
        e.preventDefault()
        if (!file) return
        const formData = new FormData()
        formData.append('file', file)
        uploadMutation.mutate(formData)
    }

    if (isLoading) return <LoadingSkeleton count={3} />

    return (
        <>
            <PageHeader
                title="Knowledge Base Management"
                subtitle="Upload PDF documents to train the RAG AI chatbot"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Card */}
                <div className="lg:col-span-1">
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Upload New Document</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="knowledge-upload"
                                    accept=".pdf"
                                />
                                <label
                                    htmlFor="knowledge-upload"
                                    className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
                                >
                                    <HiOutlineArrowUpTray className="w-8 h-8 text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {file ? file.name : 'Click to select PDF'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PDF documents only, max 20MB</p>
                                    </div>
                                </label>
                            </div>

                            {file && (
                                <div className="bg-primary-50 dark:bg-primary-900/10 p-3 rounded-lg flex items-center justify-between">
                                    <span className="text-xs font-medium text-primary-700 dark:text-primary-400 truncate max-w-[150px]">
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-xs text-red-500 hover:text-red-700 font-bold"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!file || uploadMutation.isPending}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {uploadMutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Indexing PDF...
                                    </>
                                ) : (
                                    'Upload & Index'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-amber-800 dark:text-amber-400">
                            <HiOutlineInformationCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-xs leading-relaxed">
                                When you upload a PDF, the system extracts text, breaks it into chunks, and stores embeddings in Pinecone for context-aware AI responses.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                <div className="lg:col-span-2">
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Indexed Documents</h3>
                        </div>
                        {data?.length === 0 ? (
                            <div className="p-8">
                                <EmptyState
                                    icon={HiOutlineDocumentText}
                                    title="No documents yet"
                                    description="Upload your first knowledge document to start using RAG AI."
                                />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-gray-800/30">
                                            <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Document</th>
                                            <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Chunks</th>
                                            <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Uploaded By</th>
                                            <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                            <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.map((doc) => (
                                            <tr key={doc._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
                                                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]" title={doc.originalName}>
                                                            {doc.originalName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-gray-500 dark:text-gray-400">{doc.chunkCount}</td>
                                                <td className="p-3 text-gray-500 dark:text-gray-400">{doc.uploadedBy?.name || 'Admin'}</td>
                                                <td className="p-3 text-gray-400 text-xs">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this document from the knowledge base? All associated vector embeddings will be removed.')) {
                                                                deleteMutation.mutate(doc._id)
                                                            }
                                                        }}
                                                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                                        title="Delete document"
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
