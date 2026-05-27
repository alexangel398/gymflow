import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboards temporales (Sprint 2)
const AdminDashboard   = () => <div className="p-8 text-2xl font-bold text-primary-700">Dashboard Admin ✅</div>
const TrainerDashboard = () => <div className="p-8 text-2xl font-bold text-primary-700">Dashboard Trainer ✅</div>
const MemberDashboard  = () => <div className="p-8 text-2xl font-bold text-primary-700">Dashboard Member ✅</div>

function App() {
  return (
    <Routes>
      <Route path="/login"              element={<Login />} />
      <Route path="/register"           element={<Register />} />
      <Route path="/admin/dashboard"    element={<AdminDashboard />} />
      <Route path="/trainer/dashboard"  element={<TrainerDashboard />} />
      <Route path="/member/dashboard"   element={<MemberDashboard />} />
      <Route path="*"                   element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App