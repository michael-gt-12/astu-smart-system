import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { HiOutlineBars3, HiOutlineSun, HiOutlineMoon, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'

export default function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth()
    const { darkMode, toggleDarkMode } = useTheme()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <HiOutlineBars3 className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
                    Complaint & Issue Tracking
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {darkMode ? (
                        <HiOutlineSun className="w-5 h-5 text-amber-400" />
                    ) : (
                        <HiOutlineMoon className="w-5 h-5 text-gray-600" />
                    )}
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    title="Logout"
                >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                </button>
            </div>
        </header>
    )
}
