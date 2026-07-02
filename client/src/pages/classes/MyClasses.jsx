import { useState, useEffect } from 'react'
import { getMyClasses, unenrollClass } from '../../services/class.service'
import { useAuth } from '../../context/AuthContext'

const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const MyClasses = () => {
    const { user } = useAuth()
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState(null)
    const [msg, setMsg] = useState('')

    const fetchMyClasses = async () => {
        try {
            const { data } = await getMyClasses()
            setClasses(data.data)
        } catch {
            setMsg('Error al cargar tus clases')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMyClasses() }, [])

    const handleUnenroll = async (id, name) => {
        if (!confirm(`¿Cancelar inscripción en ${name}?`)) return
        setActionId(id)
        try {
            await unenrollClass(id)
            setMsg('✅ Inscripción cancelada')
            fetchMyClasses()
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.message || 'Error al cancelar'))
        } finally {
            setActionId(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    )

    return (
        <div className="space-y-4 max-w-2xl mx-auto">

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">
                    {user.role === 'member' ? 'Mis clases inscriptas' : 'Clases que dicto'}
                </h2>
                <span className="text-sm text-gray-400">{classes.length} clase{classes.length !== 1 ? 's' : ''}</span>
            </div>

            {msg && (
                <div className={`p-3 rounded-lg text-sm ${msg.startsWith('✅')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                    {msg}
                </div>
            )}

            {classes.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="font-medium">No tenés clases todavía</p>
                    <p className="text-sm mt-1">Explorá el calendario e inscribite</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {classes.map(c => (
                        <div key={c._id}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4
                flex items-center gap-4"
                        >
                            {/* Color strip */}
                            <div
                                className="w-1.5 h-16 rounded-full flex-shrink-0"
                                style={{ backgroundColor: c.color || '#2E86C1' }}
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800">{c.name}</p>
                                <p className="text-sm text-gray-500">
                                    {DAYS_FULL[c.schedule.dayOfWeek]} · {c.schedule.startTime} – {c.schedule.endTime}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {user.role === 'member'
                                        ? `Entrenador: ${c.trainer?.name}`
                                        : `${c.enrolledCount}/${c.capacity} inscriptos`
                                    }
                                </p>
                            </div>

                            {/* Acción */}
                            {user.role === 'member' && (
                                <button
                                    onClick={() => handleUnenroll(c._id, c.name)}
                                    disabled={actionId === c._id}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200
                    text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    {actionId === c._id ? '...' : 'Cancelar'}
                                </button>
                            )}

                            {/* Badge cupo para trainer */}
                            {user.role !== 'member' && (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.isFull
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-green-100 text-green-600'
                                    }`}>
                                    {c.isFull ? 'Lleno' : `${c.availableSpots} lugar${c.availableSpots !== 1 ? 'es' : ''}`}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyClasses