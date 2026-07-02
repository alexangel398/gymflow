import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getClasses, enrollClass, unenrollClass } from '../../services/class.service'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const TYPE_LABELS = {
    yoga: 'Yoga', crossfit: 'CrossFit', spinning: 'Spinning',
    pilates: 'Pilates', funcional: 'Funcional', hiit: 'HIIT',
    boxeo: 'Boxeo', otro: 'Otro',
}

const ClassCard = ({ gymClass, onEnroll, onUnenroll, isEnrolled, loading }) => {
    const spots = gymClass.capacity - gymClass.enrolledCount
    const full = spots === 0

    return (
        <div
            className="rounded-lg p-3 text-white text-xs mb-2 shadow-sm"
            style={{ backgroundColor: gymClass.color || '#2E86C1' }}
        >
            <p className="font-semibold truncate">{gymClass.name}</p>
            <p className="opacity-90 mt-0.5">
                {gymClass.schedule.startTime} – {gymClass.schedule.endTime}
            </p>
            <p className="opacity-80 truncate">{gymClass.trainer?.name}</p>
            <div className="flex items-center justify-between mt-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${full ? 'bg-red-500/40' : 'bg-black/20'
                    }`}>
                    {full ? 'Lleno' : `${spots} lugar${spots !== 1 ? 'es' : ''}`}
                </span>
                {!full || isEnrolled ? (
                    <button
                        onClick={() => isEnrolled ? onUnenroll(gymClass._id) : onEnroll(gymClass._id)}
                        disabled={loading === gymClass._id}
                        className={`text-xs px-2 py-0.5 rounded font-medium transition-colors
              ${isEnrolled
                                ? 'bg-white/30 hover:bg-white/50'
                                : 'bg-white/20 hover:bg-white/40'
                            } disabled:opacity-50`}
                    >
                        {loading === gymClass._id ? '...' : isEnrolled ? 'Cancelar' : 'Inscribirse'}
                    </button>
                ) : null}
            </div>
        </div>
    )
}

const ClassCalendar = () => {
    const { user } = useAuth()
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoad, setActionLoad] = useState(null)
    const [msg, setMsg] = useState('')
    const [filter, setFilter] = useState('all')

    const fetchClasses = async () => {
        try {
            const { data } = await getClasses()
            console.log('DEBUG clases:', data)
            setClasses(Array.isArray(data?.data) ? data.data : [])
        } catch (err) {
            console.error('ERROR clases:', err)
            setMsg('Error al cargar las clases')
        } finally {
            setLoading(false)
        }
    }
    /* -------------------------------se edito */
    useEffect(() => {
        const init = async () => {
            await fetchClasses();
        };
        init();
    }, []);

    const isEnrolled = (gymClass) =>
        gymClass.enrolled?.some(e => e.user?._id === user._id || e.user === user._id)

    const handleEnroll = async (id) => {
        setActionLoad(id)
        setMsg('')
        try {
            const { data } = await enrollClass(id)
            setMsg('✅ ' + data.message)
            fetchClasses()
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.message || 'Error al inscribirse'))
        } finally {
            setActionLoad(null)
        }
    }

    const handleUnenroll = async (id) => {
        setActionLoad(id)
        setMsg('')
        try {
            const { data } = await unenrollClass(id)
            setMsg('✅ ' + data.message)
            fetchClasses()
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.message || 'Error al cancelar'))
        } finally {
            setActionLoad(null)
        }
    }

    const filtered = filter === 'all'
        ? classes
        : filter === 'mine'
            ? classes.filter(c => isEnrolled(c))
            : classes.filter(c => c.type === filter)

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    )

    return (
        <div className="space-y-4">

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                {[
                    { value: 'all', label: 'Todas' },
                    { value: 'mine', label: 'Mis clases' },
                    { value: 'yoga', label: 'Yoga' },
                    { value: 'crossfit', label: 'CrossFit' },
                    { value: 'spinning', label: 'Spinning' },
                    { value: 'hiit', label: 'HIIT' },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f.value
                            ? 'bg-primary-700 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Mensaje de feedback */}
            {msg && (
                <div className={`p-3 rounded-lg text-sm ${msg.startsWith('✅')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                    {msg}
                </div>
            )}

            {/* Calendario semanal — desktop */}
            <div className="hidden md:grid grid-cols-7 gap-2">
                {DAYS.map((day, dayIndex) => {
                    const dayClasses = filtered.filter(
                        c => c.schedule.dayOfWeek === dayIndex
                    )
                    return (
                        <div key={dayIndex} className="min-h-[200px]">
                            <div className="text-center text-xs font-semibold text-gray-500 uppercase
                tracking-wide py-2 mb-2 border-b border-gray-200">
                                {day}
                            </div>
                            {dayClasses.length === 0
                                ? <p className="text-xs text-gray-300 text-center mt-4">—</p>
                                : dayClasses.map(c => (
                                    <ClassCard
                                        key={c._id}
                                        gymClass={c}
                                        isEnrolled={isEnrolled(c)}
                                        onEnroll={handleEnroll}
                                        onUnenroll={handleUnenroll}
                                        loading={actionLoad}
                                    />
                                ))
                            }
                        </div>
                    )
                })}
            </div>

            {/* Lista móvil */}
            <div className="md:hidden space-y-4">
                {DAYS_FULL.map((day, dayIndex) => {
                    const dayClasses = filtered.filter(
                        c => c.schedule.dayOfWeek === dayIndex
                    )
                    if (dayClasses.length === 0) return null
                    return (
                        <div key={dayIndex}>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                {day}
                            </h3>
                            {dayClasses.map(c => (
                                <ClassCard
                                    key={c._id}
                                    gymClass={c}
                                    isEnrolled={isEnrolled(c)}
                                    onEnroll={handleEnroll}
                                    onUnenroll={handleUnenroll}
                                    loading={actionLoad}
                                />
                            ))}
                        </div>
                    )
                })}
            </div>

        </div>
    )
}

export default ClassCalendar