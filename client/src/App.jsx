import { Routes, Route, Navigate } from 'react-router-dom'

// Páginas temporales (las reemplazamos en S1-08 y S1-09)
const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow text-center">
      <h1 className="text-2xl font-bold text-primary-700">GymFlow</h1>
      <p className="text-gray-500 mt-2">Login — próximo paso</p>
    </div>
  </div>
)

const Dashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow text-center">
      <h1 className="text-2xl font-bold text-primary-700">Dashboard</h1>
      <p className="text-gray-500 mt-2">Autenticación — próximo paso</p>
    </div>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App