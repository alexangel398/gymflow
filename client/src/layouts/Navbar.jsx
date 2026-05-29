import { useAuth } from '../context/AuthContext'

const pageTitles = {
    '/admin/dashboard': 'Dashboard',
    '/admin/members': 'Miembros',
    '/admin/trainers': 'Entrenadores',
    '/admin/classes': 'Clases',
    '/admin/payments': 'Pagos',
    '/admin/attendance': 'Asistencia',
    '/trainer/dashboard': 'Dashboard',
    '/trainer/classes': 'Mis Clases',
    '/trainer/members': 'Alumnos',
    '/trainer/plans': 'Planes',
    '/trainer/attendance': 'Asistencia',
    '/member/dashboard': 'Dashboard',
    '/member/classes': 'Clases',
    '/member/plans': 'Mis Planes',
    '/member/attendance': 'Asistencia',
    '/member/payments': 'Pagos',
    '/profile': 'Mi Perfil',
}

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth()
    const title = pageTitles[window.location.pathname] || 'GymFlow'

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">

            {/* Hamburger + Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="w-5 h-0.5 bg-gray-600 mb-1" />
                    <div className="w-5 h-0.5 bg-gray-600 mb-1" />
                    <div className="w-5 h-0.5 bg-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-gray-500">
                    Hola, <span className="font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    )
}

export default Navbar