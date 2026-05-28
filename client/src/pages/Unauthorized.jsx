import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const Unauthorized = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const goHome = () => {
        navigate(
            user?.role === 'admin' ? '/admin/dashboard'
                : user?.role === 'trainer' ? '/trainer/dashboard'
                    : '/member/dashboard'
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md w-full">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso denegado</h1>
                <p className="text-gray-500 text-sm mb-6">
                    No tenés permisos para ver esta página.
                </p>
                <Button onClick={goHome}>Volver al inicio</Button>
            </div>
        </div>
    )
}

export default Unauthorized
