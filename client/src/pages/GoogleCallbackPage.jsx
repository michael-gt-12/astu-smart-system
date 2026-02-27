import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { setAccessToken, fetchUser } = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')
        const error = searchParams.get('error')

        if (error) {
            navigate('/login?error=oauth_failed')
            return
        }

        if (token) {
            setAccessToken(token)
            fetchUser().then(() => {
                navigate('/dashboard', { replace: true })
            })
        } else {
            navigate('/login')
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
            </div>
        </div>
    )
}
