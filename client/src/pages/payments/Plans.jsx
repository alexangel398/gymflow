import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPlans, createCheckout } from '../../services/payment.service'

const PLAN_FEATURES = {
    monthly: [
        'Acceso completo al gimnasio',
        'Clases grupales ilimitadas',
        'Seguimiento de progreso',
        'App mobile incluida',
    ],
    quarterly: [
        'Todo lo del plan mensual',
        'Ahorro del 11%',
        'Plan de entrenamiento personalizado',
        '1 sesión con entrenador/mes',
    ],
    annual: [
        'Todo lo del plan trimestral',
        'Ahorro del 30%',
        'Nutricionista incluido',
        'Acceso 24/7',
        'Congelamiento hasta 2 meses',
    ],
}

const PLAN_COLORS = {
    monthly: { bg: 'bg-blue-50', border: 'border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700', badge: '' },
    quarterly: { bg: 'bg-purple-50', border: 'border-purple-300', btn: 'bg-purple-600 hover:bg-purple-700', badge: 'Más popular' },
    annual: { bg: 'bg-green-50', border: 'border-green-300', btn: 'bg-green-600 hover:bg-green-700', badge: 'Mejor valor' },
}

const Plans = () => {
    const { user } = useAuth()
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(null)
    const [msg, setMsg] = useState('')

    useEffect(() => {
        getPlans()
            .then(({ data }) => setPlans(data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleCheckout = async (planId) => {
        setPaying(planId)
        setMsg('')
        try {
            const { data } = await createCheckout(planId)
            window.location.assign(data.data.url)
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.message || 'Error al procesar el pago'))
            setPaying(null)
        }
    }

    const isCurrentPlan = (planId) => user?.subscription?.plan === planId
        && user?.subscription?.status === 'active'

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Planes de Membresía</h2>
                <p className="text-gray-500 mt-1">Elegí el plan que mejor se adapte a tus objetivos</p>
            </div>

            {/* Suscripción actual */}
            {user?.subscription?.status === 'active' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-700 font-medium">
                        ✅ Tu suscripción <strong className="capitalize">{user.subscription.plan}</strong> está activa
                        {user.subscription.currentPeriodEnd && (
                            <span className="text-green-600 font-normal">
                                {' '}· Vence el {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('es-AR')}
                            </span>
                        )}
                    </p>
                </div>
            )}

            {msg && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm text-center">
                    {msg}
                </div>
            )}

            {/* Cards de planes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => {
                    const colors = PLAN_COLORS[plan.id]
                    const current = isCurrentPlan(plan.id)
                    const features = PLAN_FEATURES[plan.id] || []

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl border-2 p-6 flex flex-col
                ${colors.bg} ${colors.border}
                ${plan.id === 'quarterly' ? 'scale-105 shadow-lg' : 'shadow-sm'}
              `}
                        >
                            {/* Badge */}
                            {colors.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-purple-600 text-white text-xs font-bold
                    px-3 py-1 rounded-full">
                                        {colors.badge}
                                    </span>
                                </div>
                            )}

                            {plan.id === 'annual' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-green-600 text-white text-xs font-bold
                    px-3 py-1 rounded-full">
                                        {colors.badge}
                                    </span>
                                </div>
                            )}

                            {/* Info del plan */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold text-gray-900">{plan.amountFormatted}</span>
                                    <span className="text-gray-500 text-sm ml-1">
                                        /{plan.interval === 'month' ? 'mes' : plan.interval === 'quarter' ? 'trimestre' : 'año'}
                                    </span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2 flex-1 mb-6">
                                {features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* Botón */}
                            {current ? (
                                <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium
                  bg-green-100 text-green-700 border border-green-300">
                                    ✅ Plan actual
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleCheckout(plan.id)}
                                    disabled={paying === plan.id}
                                    className={`w-full py-2.5 rounded-xl text-white text-sm font-medium
                    transition-colors disabled:opacity-60 ${colors.btn}`}
                                >
                                    {paying === plan.id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Procesando...
                                        </span>
                                    ) : 'Suscribirme'}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            <p className="text-center text-xs text-gray-400">
                Pagos procesados de forma segura por Stripe · Podés cancelar en cualquier momento
            </p>
        </div>
    )
}

export default Plans