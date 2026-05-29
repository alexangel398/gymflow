const StatCard = ({ label, value, icon, color = 'blue', trend }) => {
    const colors = {
        blue: 'bg-blue-50   text-blue-600',
        green: 'bg-green-50  text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600',
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <span className={`text-2xl p-2 rounded-lg ${colors[color]}`}>{icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {trend && (
                <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% vs mes anterior
                </p>
            )}
        </div>
    )
}

export default StatCard