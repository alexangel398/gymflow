import { useState, useRef, useEffect } from 'react'
import Webcam from 'react-webcam'
import jsQR from 'jsqr'
import { scanQR, manualAttendance, getAttendance } from '../../services/attendance.service'
import { getClasses } from '../../services/class.service'
import { getUsers } from '../../services/user.service'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const AttendanceScanner = () => {
    const webcamRef = useRef(null)
    const canvasRef = useRef(null)
    const scanInterval = useRef(null)

    const [scanning, setScanning] = useState(false)
    const [lastScan, setLastScan] = useState(null)
    const [msg, setMsg] = useState('')
    const [msgType, setMsgType] = useState('')
    const [records, setRecords] = useState([])
    const [classes, setClasses] = useState([])
    const [members, setMembers] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [tab, setTab] = useState('qr')
    const [manualMember, setManualMember] = useState('')
    const [manualNotes, setManualNotes] = useState('')
    const [manualLoad, setManualLoad] = useState(false)

    // — Helpers —
    const showMsg = (text, type) => {
        setMsg(text)
        setMsgType(type)
        setTimeout(() => setMsg(''), 4000)
    }

    const formatTime = (date) => new Date(date).toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit',
    })

    // — Data fetching —
    const fetchRecords = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]
            const { data } = await getAttendance({ from: today })
            setRecords(data.data)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchRecords()
        getClasses().then(({ data }) => setClasses(data.data)).catch(console.error)
        getUsers().then(({ data }) => setMembers(data.data.filter(u => u.role === 'member'))).catch(console.error)
    }, [])

    // — QR Scanner —
    const stopScanning = () => {
        setScanning(false)
        clearInterval(scanInterval.current)
    }

    const handleScan = async (qrToken) => {
        stopScanning()
        try {
            const { data } = await scanQR({
                qrToken,
                classId: selectedClass || undefined,
            })
            showMsg(`✅ ${data.message}`, 'success')
            fetchRecords()
        } catch (err) {
            showMsg(`❌ ${err.response?.data?.message || 'Error al procesar QR'}`, 'error')
            setTimeout(() => setLastScan(null), 2000)
        }
    }

    const scanFrame = () => {
        if (!webcamRef.current || !canvasRef.current) return
        const video = webcamRef.current.video
        if (!video || video.readyState !== 4) return

        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code && code.data !== lastScan) {
            setLastScan(code.data)
            handleScan(code.data)
        }
    }

    const startScanning = () => {
        setScanning(true)
        setLastScan(null)
    }

    useEffect(() => {
        if (scanning) {
            scanInterval.current = setInterval(scanFrame, 500)
        } else {
            clearInterval(scanInterval.current)
        }
        return () => clearInterval(scanInterval.current)
    }, [scanning, lastScan, selectedClass])

    // — Manual —
    const handleManual = async () => {
        if (!manualMember) return showMsg('❌ Seleccioná un miembro', 'error')
        setManualLoad(true)
        try {
            const { data } = await manualAttendance({
                memberId: manualMember,
                classId: selectedClass || undefined,
                notes: manualNotes,
            })
            showMsg(`✅ ${data.message}`, 'success')
            setManualMember('')
            setManualNotes('')
            fetchRecords()
        } catch (err) {
            showMsg(`❌ ${err.response?.data?.message || 'Error al registrar'}`, 'error')
        } finally {
            setManualLoad(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Panel izquierdo */}
                <div className="space-y-4">

                    {/* Selector de clase */}
                    <Card title="Clase (opcional)">
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Entrada general (sin clase)</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.name} — {c.schedule.startTime}hs
                                </option>
                            ))}
                        </select>
                    </Card>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {['qr', 'manual'].map(t => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); stopScanning() }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t
                                        ? 'bg-primary-700 text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'
                                    }`}
                            >
                                {t === 'qr' ? '📱 Escanear QR' : '✋ Manual'}
                            </button>
                        ))}
                    </div>

                    {/* Feedback */}
                    {msg && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${msgType === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                            {msg}
                        </div>
                    )}

                    {/* QR Tab */}
                    {tab === 'qr' && (
                        <Card title="Escaner QR">
                            {scanning ? (
                                <div className="space-y-3">
                                    <div className="relative rounded-xl overflow-hidden bg-black">
                                        <Webcam
                                            ref={webcamRef}
                                            className="w-full"
                                            videoConstraints={{ facingMode: 'environment' }}
                                        />
                                        <canvas ref={canvasRef} className="hidden" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-48 h-48 border-2 border-white/50 rounded-xl relative">
                                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
                                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
                                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
                                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" onClick={stopScanning}>
                                        ⏹ Detener escaner
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-5xl mb-4">📷</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Activa la camara para escanear el QR del miembro
                                    </p>
                                    <Button onClick={startScanning}>
                                        📷 Activar camara
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Manual Tab */}
                    {tab === 'manual' && (
                        <Card title="Registro Manual">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Miembro</label>
                                    <select
                                        value={manualMember}
                                        onChange={e => setManualMember(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                      outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Selecciona un miembro...</option>
                                        {members.map(m => (
                                            <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Notas (opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: llego tarde"
                                        value={manualNotes}
                                        onChange={e => setManualNotes(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                      outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <Button onClick={handleManual} loading={manualLoad}>
                                    Registrar asistencia
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Registros de hoy */}
                <Card title={`Asistencia de Hoy (${records.length})`}>
                    {records.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-3xl mb-2">📋</p>
                            <p className="text-sm">Sin registros hoy todavia</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {records.map((r, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white
                    flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {r.member?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{r.member?.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {r.class?.name || 'General'} · {formatTime(r.date)}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${r.method === 'qr'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {r.method === 'qr' ? 'QR' : 'Manual'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

            </div>
        </div>
    )
}

export default AttendanceScanner