import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GoogleCallbackPage from './pages/GoogleCallbackPage'
import DashboardPage from './pages/DashboardPage'
import SubmitComplaintPage from './pages/SubmitComplaintPage'
import MyComplaintsPage from './pages/MyComplaintsPage'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import AllComplaintsPage from './pages/AllComplaintsPage'
import AssignedComplaintsPage from './pages/AssignedComplaintsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import UsersPage from './pages/UsersPage'
import CategoriesPage from './pages/CategoriesPage'
import ChatbotPage from './pages/ChatbotPage'
import KnowledgePage from './pages/KnowledgePage'

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to="/login" replace />

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

            {/* Protected routes */}
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Student routes */}
                <Route path="/complaints/new" element={
                    <ProtectedRoute roles={['student']}><SubmitComplaintPage /></ProtectedRoute>
                } />
                <Route path="/complaints" element={
                    <ProtectedRoute roles={['student']}><MyComplaintsPage /></ProtectedRoute>
                } />
                <Route path="/chatbot" element={
                    <ProtectedRoute roles={['student']}><ChatbotPage /></ProtectedRoute>
                } />

                {/* Staff routes */}
                <Route path="/complaints/assigned" element={
                    <ProtectedRoute roles={['category_staff']}><AssignedComplaintsPage /></ProtectedRoute>
                } />

                {/* Admin/Staff routes */}
                <Route path="/complaints/all" element={
                    <ProtectedRoute roles={['admin', 'category_staff']}><AllComplaintsPage /></ProtectedRoute>
                } />
                <Route path="/complaints/:id" element={<ComplaintDetailPage />} />

                {/* Admin routes */}
                <Route path="/analytics" element={
                    <ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>
                } />
                <Route path="/users" element={
                    <ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>
                } />
                <Route path="/categories" element={
                    <ProtectedRoute roles={['admin']}><CategoriesPage /></ProtectedRoute>
                } />
                <Route path="/knowledge" element={
                    <ProtectedRoute roles={['admin']}><KnowledgePage /></ProtectedRoute>
                } />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}
