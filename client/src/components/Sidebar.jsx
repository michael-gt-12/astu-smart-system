import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    HiOutlineHome, HiOutlineDocumentText, HiOutlinePlusCircle,
    HiOutlineUsers, HiOutlineTag, HiOutlineChartBar,
    HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlineClipboardDocumentList,
    HiOutlineAcademicCap
} from 'react-icons/hi2'

const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/complaints/new', label: 'Submit Complaint', icon: HiOutlinePlusCircle },
    { to: '/complaints', label: 'My Complaints', icon: HiOutlineDocumentText },
    { to: '/chatbot', label: 'AI Assistant', icon: HiOutlineChatBubbleLeftRight },
]

const staffLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/complaints/assigned', label: 'Assigned Complaints', icon: HiOutlineClipboardDocumentList },
    { to: '/complaints/all', label: 'All Complaints', icon: HiOutlineDocumentText },
]

const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
    { to: '/complaints/all', label: 'All Complaints', icon: HiOutlineDocumentText },
    { to: '/users', label: 'Manage Users', icon: HiOutlineUsers },
    { to: '/categories', label: 'Categories', icon: HiOutlineTag },
    { to: '/knowledge', label: 'Knowledge Base', icon: HiOutlineAcademicCap },
]

export default function Sidebar({ open, onClose }) {
    const { user } = useAuth()

    const links = user?.role === 'admin' ? adminLinks
        : user?.role === 'category_staff' ? staffLinks
            : studentLinks

    const roleLabel = user?.role === 'admin' ? 'Administrator'
        : user?.role === 'category_staff' ? 'Category Staff'
            : 'Student'

    const roleColor = user?.role === 'admin' ? 'bg-red-500'
        : user?.role === 'category_staff' ? 'bg-amber-500'
            : 'bg-primary-500'

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border
        flex flex-col transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AS</span>
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            ASTU Smart
                        </span>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <HiOutlineXMark className="w-5 h-5" />
                    </button>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{user?.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={`w-2 h-2 rounded-full ${roleColor}`} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5 flex-shrink-0" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border">
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        © 2026 ASTU Smart System
                    </p>
                </div>
            </aside>
        </>
    )
}
