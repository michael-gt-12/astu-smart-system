import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { register, user } = useAuth()
    const navigate = useNavigate()

    if (user) {
        navigate('/dashboard', { replace: true })
        return null
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match')
        }
        setLoading(true)
        try {
            await register(form.name, form.email, form.password)
            navigate('/dashboard')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-bg">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">AS</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">ASTU Smart</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Join the smart complaint system</p>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                    <div>
                        <label className="label">Full Name</label>
                        <div className="relative">
                            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input name="name" value={form.name} onChange={handleChange} className="input-field pl-10" placeholder="Your full name" required />
                        </div>
                    </div>

                    <div>
                        <label className="label">Email</label>
                        <div className="relative">
                            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field pl-10" placeholder="Your email" required />
                        </div>
                    </div>

                    <div>
                        <label className="label">Password</label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} className="input-field pl-10 pr-10" placeholder="Min 6 characters" required minLength={6} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label">Confirm Password</label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input-field pl-10" placeholder="Repeat password" required />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
