import { useState, useEffect } from 'react'
import { getTrainers } from '../../services/trainer.service'
import Card from '../../components/ui/Card'

const SPECIALTY_LABELS = {
    yoga: 'Yoga', crossfit: 'CrossFit', spinning: 'Spinning',
    pilates: 'Pilates', funcional: 'Funcional', hiit: 'HIIT',
    boxeo: 'Boxeo', nutricion: 'Nutrición', otro: 'Otro',
}

const TrainerList = () => {
    const [trainers, setTrainers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        getTrainers()
            .then(({ data }) => setTrainers(data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = trainers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    )

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
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    placeholder="Buscar entrenador..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm
            outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-400">{filtered.length} entrenador{filtered.length !== 1 ? 'es' : ''}</span>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">🏋️</p>
                    <p className="font-medium">No hay entrenadores registrados</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(trainer => (
                        <Card key={trainer._id}>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-700 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden">
                                    {trainer.avatar
                                        ? <img src={`http://localhost:5000${trainer.avatar}`} alt={trainer.name} className="w-full h-full object-cover" />
                                        : trainer.name.charAt(0).toUpperCase()
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 truncate">{trainer.name}</h3>
                                    <p className="text-xs text-gray-400 mb-2">{trainer.email}</p>
                                    {trainer.bio && (
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{trainer.bio}</p>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                        {trainer.trainerProfile?.specialties?.map(s => (
                                            <span key={s} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                                                {SPECIALTY_LABELS[s] || s}
                                            </span>
                                        ))}
                                    </div>
                                    {trainer.trainerProfile?.experience > 0 && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            {trainer.trainerProfile.experience} año{trainer.trainerProfile.experience !== 1 ? 's' : ''} de experiencia
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TrainerList