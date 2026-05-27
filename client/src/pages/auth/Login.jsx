import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const e = {}
        if (!form.email) e.email = 'El email es obligatorio'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
        if (!form.password) e.password = 'La contraseña es obligatoria'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const e2 = validate()
        if (Object.keys(e2).length) return setErrors(e2)
        setErrors({})
        setApiError('')
        setLoading(true)
        try {
            const user = await login(form.email, form.password)
            navigate(
                user.role === 'admin' ? '/admin/dashboard'
                    : user.role === 'trainer' ? '/trainer/dashboard'
                        : '/member/dashboard'
            )
        } catch (err) {
            setApiError(err.response?.data?.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">GymFlow</h1>
                    <p className="text-primary-100 mt-2 text-sm">Sistema de Gestión de Gimnasio</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Iniciar sesión</h2>

                    {apiError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            error={errors.email}
                        />
                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            error={errors.password}
                        />
                        <Button type="submit" loading={loading} className="mt-2">
                            Ingresar
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        ¿No tenés cuenta?{' '}
                        <Link to="/register" className="text-primary-600 font-medium hover:underline">
                            Registrarse
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
