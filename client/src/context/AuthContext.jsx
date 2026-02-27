import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) {
                setLoading(false)
                return
            }
            const { data } = await api.get('/auth/me')
            setUser(data.data.user)
        } catch (error) {
            localStorage.removeItem('accessToken')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('accessToken', data.data.accessToken)
        setUser(data.data.user)
        toast.success('Login successful!')
        return data.data
    }

    const register = async (name, email, password, role) => {
        const { data } = await api.post('/auth/register', { name, email, password, role })
        localStorage.setItem('accessToken', data.data.accessToken)
        setUser(data.data.user)
        toast.success('Registration successful!')
        return data.data
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (e) {
            // ignore
        }
        localStorage.removeItem('accessToken')
        setUser(null)
        toast.success('Logged out successfully')
    }

    const setAccessToken = (token) => {
        localStorage.setItem('accessToken', token)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, fetchUser, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    )
}
