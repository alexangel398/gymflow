import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyPayments } from '../../services/payment.service'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    past_due: 'bg-red-100 text-red-600',
    canceled: 'bg-red-100 text-red-500',
}

const STATUS_LABELS = {
    active: 'Activo', inactive: 'Inactivo',
    past_due: 'Vencido', canceled: 'Cancelado',
}

const PLAN_LABELS = {
    monthly: 'Mensual', quarterly: 'Trimestral', annual: 'Anual',
}

const MemberPayments = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMyPayments()
            .then(({ data }) => setPayments(data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Estado suscripción actual */}
            <Card title="Mi Suscripción">
                {user?.subscription?.status === 'active' ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Plan actual</p>
                            <p className="text-xl font-bold text-gray-800 capitalize mt-0.5">
                                {PLAN_LABELS[user.subscription.plan] || user.subscription.plan}
                            </p>
                            {user.subscription.currentPeriodEnd && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Vence el {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('es-AR')}
                                </p>
                            )}
                        </div>
                        <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full">
                            ✅ Activa
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">No tenés una suscripción activa</p>
                            <p className="text-xs text-gray-400 mt-1">Suscribite para acceder a todas las funciones</p>
                        </div>
                        <Button
                            onClick={() => navigate('/member/payments/plans')}
                            className="w-auto px-4"
                        >
                            Ver planes
                        </Button>
                    </div>
                )}
            </Card>

            {/* Botón ver planes */}
            <Button
                variant="secondary"
                onClick={() => navigate('/member/payments/plans')}
            >
                💳 Ver todos los planes disponibles
            </Button>

            {/* Historial */}
            <Card title={`Historial de Pagos (${payments.length})`}>
                {payments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-3xl mb-2">💳</p>
                        <p className="text-sm">No hay pagos registrados todavía</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Plan {PLAN_LABELS[p.plan]}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(p.createdAt).toLocaleDateString('es-AR')}
                                        {p.currentPeriodEnd && ` · hasta ${new Date(p.currentPeriodEnd).toLocaleDateString('es-AR')}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">${(p.amount / 100).toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                                        {STATUS_LABELS[p.status]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}

export default MemberPayments