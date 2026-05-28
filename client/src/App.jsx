import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

//Pages
import Unauthorized from './pages/Unauthorized'

// Dashboards temporales (Sprint 2)
const AdminDashboard = () => <div className="p-8 text-2xl font-bold text-primary-700">Dashboard Admin ✅</div>
const TrainerDashboard = () => <div className="p-8 text-2xl font-bold text-primary-700">Dashboard Trainer ✅</div>
const MemberDashboard = () => <div className="p-8 text-2xl font-bold text-primary-700">Dashboard Member ✅</div>

// Redirección inteligente según rol
const RoleRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'trainer') return <Navigate to="/trainer/dashboard" replace />
  return <Navigate to="/member/dashboard" replace />
}

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Redirección raíz */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Trainer */}
      <Route path="/trainer/dashboard" element={
        <ProtectedRoute allowedRoles={['trainer', 'admin']}>
          <TrainerDashboard />
        </ProtectedRoute>
      } />

      {/* Member */}
      <Route path="/member/dashboard" element={
        <ProtectedRoute allowedRoles={['member', 'trainer', 'admin']}>
          <MemberDashboard />
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App