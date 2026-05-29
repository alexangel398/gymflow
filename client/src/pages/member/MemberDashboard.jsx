import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'

const MemberDashboard = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Clases Este Mes" value="12" icon="📅" color="blue" />
            <StatCard label="Asistencia" value="85%" icon="✅" color="green" />
            <StatCard label="Suscripción" value="Activa" icon="💳" color="orange" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title="Próximas Clases">
                <div className="space-y-3">
                    {[
                        { name: 'Yoga', date: 'Hoy', time: '18:00', trainer: 'Laura M.' },
                        { name: 'CrossFit', date: 'Mañana', time: '09:00', trainer: 'Diego R.' },
                        { name: 'Pilates', date: 'Viernes', time: '19:30', trainer: 'Ana P.' },
                    ].map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-primary-700 text-white rounded-lg flex flex-col items-center justify-center text-xs font-bold flex-shrink-0">
                                <span>{c.time.split(':')[0]}</span>
                                <span className="font-normal opacity-80">{c.time.split(':')[1]}hs</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{c.name}</p>
                                <p className="text-xs text-gray-400">{c.date} · {c.trainer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Mi Progreso">
                <div className="space-y-4">
                    {[
                        { label: 'Asistencia mensual', value: 85 },
                        { label: 'Objetivos cumplidos', value: 60 },
                        { label: 'Plan de dieta', value: 40 },
                    ].map((p, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{p.label}</span>
                                <span className="font-medium text-gray-700">{p.value}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div
                                    className="h-2 bg-primary-600 rounded-full transition-all"
                                    style={{ width: `${p.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Suscripción vigente hasta</p>
                    <p className="text-sm font-semibold text-gray-700">30 de Junio de 2026</p>
                </div>
            </Card>
        </div>
    </div>
)

export default MemberDashboard