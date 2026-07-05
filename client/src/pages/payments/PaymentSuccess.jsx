import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { verifyPayment } from '../../services/payment.service'

const PaymentSuccess = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const sessionId = searchParams.get('session_id') // 2. Extraemos el ID

        if (sessionId) {
            // 3. Validamos en el servidor
            verifyPayment(sessionId)
                .then(() => console.log("Pago verificado y suscripción activada"))
                .catch(err => console.error("Error al verificar pago:", err))
        }
    }, [searchParams])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Pago exitoso!</h1>
                <p className="text-gray-500 text-sm mb-6">
                    Tu suscripción fue activada correctamente. Ya podés disfrutar de todos los beneficios de GymFlow.
                </p>
                <Button onClick={() => navigate('/member/dashboard')}>
                    Ir al Dashboard
                </Button>
            </div>
        </div>
    )
}

export default PaymentSuccess