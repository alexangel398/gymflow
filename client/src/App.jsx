import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

// Auth
import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import Unauthorized from './pages/Unauthorized'

// Dashboards
import AdminDashboard   from './pages/admin/AdminDashboard'
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import MemberDashboard  from './pages/member/MemberDashboard'
import Profile from './pages/profile/Profile'

// Placeholder para rutas futuras
const ComingSoon = ({ name }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-4xl mb-3">🚧</p>
      <p className="text-lg font-semibold text-gray-600">{name}</p>
      <p className="text-sm text-gray-400 mt-1">Disponible en próximos sprints</p>
    </div>
  </div>
)

const RoleRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin')   return <Navigate to="/admin/dashboard"   replace />
  if (user.role === 'trainer') return <Navigate to="/trainer/dashboard" replace />
  return <Navigate to="/member/dashboard" replace />
}

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/"             element={<RoleRedirect />} />

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']}><MainLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard"  element={<AdminDashboard />} />
        <Route path="/admin/members"    element={<ComingSoon name="Gestión de Miembros" />} />
        <Route path="/admin/trainers"   element={<ComingSoon name="Gestión de Entrenadores" />} />
        <Route path="/admin/classes"    element={<ComingSoon name="Clases" />} />
        <Route path="/admin/payments"   element={<ComingSoon name="Pagos" />} />
        <Route path="/admin/attendance" element={<ComingSoon name="Asistencia" />} />
      </Route>

      {/* Trainer */}
      <Route element={<ProtectedRoute allowedRoles={['trainer','admin']}><MainLayout /></ProtectedRoute>}>
        <Route path="/trainer/dashboard"  element={<TrainerDashboard />} />
        <Route path="/trainer/classes"    element={<ComingSoon name="Mis Clases" />} />
        <Route path="/trainer/members"    element={<ComingSoon name="Mis Alumnos" />} />
        <Route path="/trainer/plans"      element={<ComingSoon name="Planes" />} />
        <Route path="/trainer/attendance" element={<ComingSoon name="Asistencia" />} />
      </Route>

      {/* Member */}
      <Route element={<ProtectedRoute allowedRoles={['member','trainer','admin']}><MainLayout /></ProtectedRoute>}>
        <Route path="/member/dashboard"  element={<MemberDashboard />} />
        <Route path="/member/classes"    element={<ComingSoon name="Clases Disponibles" />} />
        <Route path="/member/plans"      element={<ComingSoon name="Mis Planes" />} />
        <Route path="/member/attendance" element={<ComingSoon name="Mi Asistencia" />} />
        <Route path="/member/payments"   element={<ComingSoon name="Mis Pagos" />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App