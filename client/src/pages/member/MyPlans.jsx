import { useState, useEffect } from 'react'
import { getMyPlans } from '../../services/plan.service'
import Card from '../../components/ui/Card'

const GOAL_LABELS = {
    perdida_peso: 'Pérdida de peso',
    ganancia_muscular: 'Ganancia muscular',
    mantenimiento: 'Mantenimiento',
    rendimiento: 'Rendimiento',
    salud: 'Salud general',
}

/* const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
 */
const PlanCard = ({ plan }) => {
    const [expanded, setExpanded] = useState(false)
    const isWorkout = plan.type === 'workout'

    return (
        <Card>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isWorkout
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                            {isWorkout ? '💪 Entrenamiento' : '🥗 Dieta'}
                        </span>
                        <span className="text-xs text-gray-400">{plan.duration} semanas</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{plan.title}</h3>
                    <p className="text-xs text-gray-500">
                        Por {plan.trainer?.name} · {GOAL_LABELS[plan.goal]}
                    </p>
                </div>
                {plan.fileUrl && (

                    <a
                    href = {`http://localhost:5000${plan.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg
                    hover:bg-primary-100 transition-colors flex-shrink-0"
                    >
                📄 PDF
            </a>
        )}
        </div>

    {
        plan.description && (
            <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
        )
    }

    {/* Workout days */ }
    {
        isWorkout && plan.workoutDays?.length > 0 && (
            <div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-primary-600 font-medium hover:underline mb-2"
                >
                    {expanded ? '▲ Ocultar rutina' : '▼ Ver rutina completa'}
                </button>
                {expanded && (
                    <div className="space-y-3 mt-2">
                        {plan.workoutDays.map((day, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-semibold text-primary-700 mb-1">
                                    {day.day} {day.focus && `— ${day.focus}`}
                                </p>
                                <div className="space-y-1">
                                    {day.exercises.map((ex, j) => (
                                        <div key={j} className="flex items-center justify-between text-xs text-gray-600">
                                            <span className="font-medium">{ex.name}</span>
                                            <span className="text-gray-400">{ex.sets}x{ex.reps} · {ex.rest}</span>
                                        </div>
                                    ))}
                                </div>
                                {day.notes && <p className="text-xs text-gray-400 mt-1 italic">{day.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    {/* Diet meals */ }
    {
        !isWorkout && plan.meals?.length > 0 && (
            <div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-primary-600 font-medium hover:underline mb-2"
                >
                    {expanded ? '▲ Ocultar plan' : '▼ Ver plan completo'}
                </button>
                {expanded && (
                    <div className="space-y-2 mt-2">
                        {plan.totalCalories > 0 && (
                            <div className="flex gap-4 text-xs text-center mb-3">
                                <div className="flex-1 bg-orange-50 rounded-lg p-2">
                                    <p className="font-bold text-orange-600">{plan.totalCalories}</p>
                                    <p className="text-gray-500">kcal</p>
                                </div>
                                <div className="flex-1 bg-red-50 rounded-lg p-2">
                                    <p className="font-bold text-red-500">{plan.macros?.protein}g</p>
                                    <p className="text-gray-500">Proteínas</p>
                                </div>
                                <div className="flex-1 bg-yellow-50 rounded-lg p-2">
                                    <p className="font-bold text-yellow-600">{plan.macros?.carbs}g</p>
                                    <p className="text-gray-500">Carbos</p>
                                </div>
                                <div className="flex-1 bg-blue-50 rounded-lg p-2">
                                    <p className="font-bold text-blue-500">{plan.macros?.fats}g</p>
                                    <p className="text-gray-500">Grasas</p>
                                </div>
                            </div>
                        )}
                        {plan.meals.map((meal, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-primary-700">{meal.name}</p>
                                    {meal.time && <span className="text-xs text-gray-400">{meal.time}hs</span>}
                                    {meal.calories > 0 && <span className="text-xs text-orange-500 ml-auto">{meal.calories} kcal</span>}
                                </div>
                                <ul className="space-y-0.5">
                                    {meal.foods.map((food, j) => (
                                        <li key={j} className="text-xs text-gray-600">• {food}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    <p className="text-xs text-gray-300 mt-3">
        Creado el {new Date(plan.createdAt).toLocaleDateString('es-AR')}
    </p>
    </Card >
    )
}

const MyPlans = () => {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        getMyPlans()
            .then(({ data }) => setPlans(data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = filter === 'all'
        ? plans
        : plans.filter(p => p.type === filter)

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
                <div className="flex gap-2">
                    {['all', 'workout', 'diet'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-primary-700 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'workout' ? '💪 Entreno' : '🥗 Dieta'}
                        </button>
                    ))}
                </div>
                <span className="text-sm text-gray-400">{filtered.length} plan{filtered.length !== 1 ? 'es' : ''}</span>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-medium">No tenés planes asignados todavía</p>
                    <p className="text-sm mt-1">Tu entrenador te asignará un plan pronto</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(plan => <PlanCard key={plan._id} plan={plan} />)}
                </div>
            )}
        </div>
    )
}

export default MyPlans