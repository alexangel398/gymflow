import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const PaymentCancel = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
                <div className="text-6xl mb-4">😕</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago cancelado</h1>
                <p className="text-gray-500 text-sm mb-6">
                    No se realizó ningún cobro. Podés intentarlo nuevamente cuando quieras.
                </p>
                <Button onClick={() => navigate('/member/payments')}>
                    Ver planes
                </Button>
            </div>
        </div>
    )
}

export default PaymentCancel