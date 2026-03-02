import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { LoadingSkeleton, PageHeader } from '../components/UI'

export default function CategoriesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories').then(r => r.data.data),
    })

    if (isLoading) return <LoadingSkeleton count={4} />

    const categories = data?.categories || []

    return (
        <>
            <PageHeader
                title="Categories"
                subtitle={`${categories.length} categories`}
            />

            <div className="grid gap-3 md:grid-cols-2">
                {categories.map(cat => (
                    <div key={cat._id} className="card p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">{cat.name}</h3>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{cat.staffUserId?.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cat.description || 'No description'}</p>
                    </div>
                ))}
            </div>
        </>
    )
}
