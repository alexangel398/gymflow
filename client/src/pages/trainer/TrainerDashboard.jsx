import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'

const TrainerDashboard = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Mis Clases Hoy" value="3" icon="📅" color="blue" />
            <StatCard label="Alumnos Activos" value="28" icon="👥" color="green" />
            <StatCard label="Asistencia Media" value="87%" icon="📈" color="purple" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title="Mis Clases de Hoy">
                <div className="space-y-3">
                    {[
                        { name: 'CrossFit Avanzado', time: '09:00', enrolled: 12, capacity: 15 },
                        { name: 'HIIT', time: '12:00', enrolled: 8, capacity: 10 },
                        { name: 'Funcional', time: '19:00', enrolled: 14, capacity: 15 },
                    ].map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-700">{c.name}</p>
                                <p className="text-xs text-gray-400">{c.time}hs</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-primary-700">{c.enrolled}/{c.capacity}</p>
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                                    <div
                                        className="h-1.5 bg-primary-600 rounded-full"
                                        style={{ width: `${(c.enrolled / c.capacity) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Alumnos Asignados">
                <div className="space-y-2">
                    {[
                        { name: 'Roberto Silva', progress: 72, plan: 'Fuerza' },
                        { name: 'Camila Torres', progress: 45, plan: 'Cardio' },
                        { name: 'Lucas Méndez', progress: 90, plan: 'Masa' },
                        { name: 'Sofía Ruiz', progress: 60, plan: 'Pérdida' },
                    ].map((a, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {a.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-medium text-gray-700 truncate">{a.name}</p>
                                    <span className="text-xs text-gray-400 ml-2">{a.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                                    <div
                                        className="h-1.5 bg-green-500 rounded-full"
                                        style={{ width: `${a.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
)

export default TrainerDashboard