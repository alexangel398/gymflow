import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAsRead, markAllAsRead } from '../services/notification.service'

const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
}


const TYPE_ICONS = {
    class: '📅',
    plan: '📋',
    payment: '💳',
    attendance: '✅',
    system: '🔔',
}

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([])
    const [unread, setUnread] = useState(0)
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const ref = useRef(null)

    const fetchNotifications = async () => {
        try {
            const { data } = await getNotifications()
            setNotifications(data.data)
            setUnread(data.unread)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Polling cada 60 segundos
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleRead = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id)
            fetchNotifications()
        }
        if (notification.link) navigate(notification.link)
        setOpen(false)
    }

    const handleMarkAll = async () => {
        await markAllAsRead()
        fetchNotifications()
    }

    return (
        <div className="relative" ref={ref}>
            {/* Campana */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white
            text-xs rounded-full flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl
          border border-gray-100 z-50 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-gray-700 text-sm">Notificaciones</span>
                        {unread > 0 && (
                            <button
                                onClick={handleMarkAll}
                                className="text-xs text-primary-600 hover:underline"
                            >
                                Marcar todas como leidas
                            </button>
                        )}
                    </div>

                    {/* Lista */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-2xl mb-1">🔔</p>
                                <p className="text-xs">Sin notificaciones</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => handleRead(n)}
                                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50
                    border-b border-gray-50 transition-colors
                    ${!n.read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-xs text-gray-300 mt-1">{formatTime(n.createdAt)}</p>
                                    </div>
                                    {!n.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell