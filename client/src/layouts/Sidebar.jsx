import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuByRole = {
    admin: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'Miembros', path: '/admin/members', icon: '👥' },
        { label: 'Entrenadores', path: '/admin/trainers', icon: '🏋️' },
        { label: 'Clases', path: '/admin/classes', icon: '📅' },
        { label: 'Pagos', path: '/admin/payments', icon: '💳' },
        { label: 'Asistencia', path: '/admin/attendance', icon: '✅' },
    ],
    trainer: [
        { label: 'Dashboard', path: '/trainer/dashboard', icon: '📊' },
        { label: 'Mis Clases', path: '/trainer/classes', icon: '📅' },
        { label: 'Alumnos', path: '/trainer/members', icon: '👥' },
        { label: 'Planes', path: '/trainer/plans', icon: '📋' },
        { label: 'Asistencia', path: '/trainer/attendance', icon: '✅' },
    ],
    member: [
        { label: 'Dashboard', path: '/member/dashboard', icon: '📊' },
        { label: 'Clases', path: '/member/classes', icon: '📅' },
        { label: 'Mis Clases',    path: '/member/my-classes',  icon: '✅' },
        { label: 'Mis Planes', path: '/member/plans', icon: '📋' },
        { label: 'Asistencia', path: '/member/attendance', icon: '✅' },
        { label: 'Pagos', path: '/member/payments', icon: '💳' },
    ],
}

const Sidebar = ({ open, onClose }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const menu = menuByRole[user?.role] || []

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <>
            {/* Overlay mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-primary-700 text-white z-30
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        `}>

                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-primary-600">
                    <span className="text-xl font-bold tracking-tight">GymFlow</span>
                    <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white text-xl">
                        ✕
                    </button>
                </div>

                {/* User info */}
                <div className="px-6 py-4 border-b border-primary-600">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-primary-200 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {menu.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                                }
            `}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-primary-600">
                    <NavLink
                        to="/profile"
                        onClick={onClose}
                        className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                text-sm font-medium transition-colors
                ${isActive
                                ? 'bg-white/20 text-white'
                                : 'text-primary-100 hover:bg-white/10 hover:text-white'
                            }
            `}
                    >
                        <span>👤</span> Mi Perfil
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium text-primary-100 hover:bg-red-500/20
                hover:text-red-200 transition-colors"
                    >
                        <span>🚪</span> Cerrar sesión
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar