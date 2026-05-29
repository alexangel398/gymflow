import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'

const recent = [
    { name: 'María López', email: 'maria@mail.com', plan: 'Mensual', status: 'Activo' },
    { name: 'Carlos Pérez', email: 'carlos@mail.com', plan: 'Trimestral', status: 'Activo' },
    { name: 'Ana García', email: 'ana@mail.com', plan: 'Anual', status: 'Vencido' },
]

const AdminDashboard = () => (
    <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Miembros Activos" value="124" icon="👥" color="blue" trend={8} />
            <StatCard label="Clases Esta Semana" value="18" icon="📅" color="purple" trend={5} />
            <StatCard label="Ingresos del Mes" value="$4.820" icon="💰" color="green" trend={12} />
            <StatCard label="Asistencia Hoy" value="37" icon="✅" color="orange" trend={-3} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Miembros recientes */}
            <Card title="Miembros Recientes">
                <div className="space-y-3">
                    {recent.map((m, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-bold">
                                    {m.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{m.name}</p>
                                    <p className="text-xs text-gray-400">{m.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{m.plan}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.status === 'Activo'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-500'
                                    }`}>
                                    {m.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Clases de hoy */}
            <Card title="Clases de Hoy">
                <div className="space-y-3">
                    {[
                        { name: 'Yoga Matutino', time: '08:00', trainer: 'Laura M.', spots: '8/12' },
                        { name: 'CrossFit', time: '10:00', trainer: 'Diego R.', spots: '15/15' },
                        { name: 'Spinning', time: '18:00', trainer: 'Ana P.', spots: '6/20' },
                        { name: 'Pilates', time: '19:30', trainer: 'Laura M.', spots: '10/12' },
                    ].map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-gray-700">{c.name}</p>
                                <p className="text-xs text-gray-400">{c.trainer} · {c.time}hs</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${c.spots.split('/')[0] === c.spots.split('/')[1]
                                    ? 'bg-red-100 text-red-500'
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                {c.spots}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
)

export default AdminDashboard