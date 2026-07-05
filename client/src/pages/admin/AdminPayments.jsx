import { useState, useEffect } from 'react'
import { getPayments } from '../../services/payment.service'
import Card from '../../components/ui/Card'

const STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    past_due: 'bg-red-100 text-red-600',
    canceled: 'bg-red-100 text-red-500',
    trialing: 'bg-blue-100 text-blue-600',
}

const STATUS_LABELS = {
    active: 'Activo',
    inactive: 'Inactivo',
    past_due: 'Vencido',
    canceled: 'Cancelado',
    trialing: 'Prueba',
}

const PLAN_LABELS = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annual: 'Anual',
}

const AdminPayments = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        getPayments()
            .then(({ data }) => setPayments(data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = filter === 'all'
        ? payments
        : payments.filter(p => p.status === filter)

    const totalRevenue = payments
        .filter(p => p.status === 'active')
        .reduce((sum, p) => sum + p.amount, 0)

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <p className="text-sm text-gray-500">Total suscripciones</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{payments.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Suscripciones activas</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                        {payments.filter(p => p.status === 'active').length}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Ingresos totales</p>
                    <p className="text-3xl font-bold text-primary-700 mt-1">
                        ${(totalRevenue / 100).toFixed(2)}
                    </p>
                </Card>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                {['all', 'active', 'inactive', 'past_due', 'canceled'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f
                                ? 'bg-primary-700 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400'
                            }`}
                    >
                        {f === 'all' ? 'Todos' : STATUS_LABELS[f]}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <Card title={`Pagos (${filtered.length})`}>
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-3xl mb-2">💳</p>
                        <p className="text-sm">No hay pagos registrados todavía</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100">
                                    <th className="pb-3 font-medium">Miembro</th>
                                    <th className="pb-3 font-medium">Plan</th>
                                    <th className="pb-3 font-medium">Monto</th>
                                    <th className="pb-3 font-medium">Estado</th>
                                    <th className="pb-3 font-medium">Vencimiento</th>
                                    <th className="pb-3 font-medium">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary-700 text-white
                          flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {p.member?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">{p.member?.name}</p>
                                                    <p className="text-xs text-gray-400">{p.member?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-600">{PLAN_LABELS[p.plan]}</td>
                                        <td className="py-3 font-medium text-gray-800">
                                            ${(p.amount / 100).toFixed(2)}
                                        </td>
                                        <td className="py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                                                {STATUS_LABELS[p.status]}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-500 text-xs">
                                            {p.currentPeriodEnd
                                                ? new Date(p.currentPeriodEnd).toLocaleDateString('es-AR')
                                                : '—'
                                            }
                                        </td>
                                        <td className="py-3 text-gray-400 text-xs">
                                            {new Date(p.createdAt).toLocaleDateString('es-AR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AdminPayments