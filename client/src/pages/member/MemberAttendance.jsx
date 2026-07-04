import { useState, useEffect } from 'react'
import { getMyQR, getMyAttendance } from '../../services/attendance.service'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const MemberAttendance = () => {
    const [qrData, setQrData] = useState(null)
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [qrLoading, setQrLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [msg, setMsg] = useState('')

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const { data } = await getMyAttendance()
            setRecords(data.data)
        } catch {
            setMsg('Error al cargar el historial')
        } finally {
            setLoading(false)
        }
    }

    const generateQR = async () => {
        setQrLoading(true)
        setMsg('')
        try {
            const { data } = await getMyQR()
            setQrData(data.data)
            setTimeLeft(data.data.expiresIn)
        } catch {
            setMsg('Error al generar el QR')
        } finally {
            setQrLoading(false)
        }
    }

    // Countdown del QR
    useEffect(() => {
        if (timeLeft <= 0) {
            if (qrData) {
                setQrData(null)
                setMsg('⏱ QR expirado. Generá uno nuevo.')
            }
            return
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
        return () => clearInterval(timer)
    }, [timeLeft, qrData])

    useEffect(() => { fetchHistory() }, [])

    const formatDate = (date) => new Date(date).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })

    return (
        <div className="space-y-6 max-w-2xl mx-auto">

            {/* QR Card */}
            <Card title="Mi Código QR de Asistencia">
                <p className="text-sm text-gray-500 mb-4">
                    Mostrá este código al entrenador para registrar tu asistencia.
                    El QR es válido por <strong>5 minutos</strong>.
                </p>

                {msg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${msg.startsWith('⏱') || msg.startsWith('❌')
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        {msg}
                    </div>
                )}

                {qrData ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-white rounded-xl shadow-md border-2 border-primary-100">
                            <img
                                src={qrData.qrImage}
                                alt="QR de asistencia"
                                className="w-56 h-56"
                            />
                        </div>

                        {/* Countdown */}
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full animate-pulse ${timeLeft > 60 ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                            <span className={`text-sm font-medium ${timeLeft > 60 ? 'text-green-600' : 'text-red-500'
                                }`}>
                                Expira en {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                            </span>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={generateQR}
                            loading={qrLoading}
                            className="w-auto px-6"
                        >
                            🔄 Regenerar QR
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-5xl">
                            📱
                        </div>
                        <Button onClick={generateQR} loading={qrLoading} className="w-auto px-8">
                            Generar mi QR
                        </Button>
                    </div>
                )}
            </Card>

            {/* Historial */}
            <Card title={`Historial de Asistencia (${records.length} registros)`}>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <svg className="animate-spin h-6 w-6 text-primary-600" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-3xl mb-2">📋</p>
                        <p className="text-sm">No hay registros de asistencia todavía</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {records.map((r, i) => (
                            <div key={i} className="flex items-center justify-between py-2.5 px-3
                bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-2 h-8 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: r.class?.color || '#2E86C1' }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {r.class?.name || 'Entrada general'}
                                        </p>
                                        <p className="text-xs text-gray-400">{formatDate(r.date)}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.method === 'qr'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {r.method === 'qr' ? '📱 QR' : '✋ Manual'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

        </div>
    )
}

export default MemberAttendance