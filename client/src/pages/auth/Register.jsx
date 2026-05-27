import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const Register = () => {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'El nombre es obligatorio'
        if (!form.email) e.email = 'El email es obligatorio'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
        if (!form.password) e.password = 'La contraseña es obligatoria'
        else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
        if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
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
            await register(form.name, form.email, form.password)
            navigate('/member/dashboard')
        } catch (err) {
            setApiError(err.response?.data?.message || 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">GymFlow</h1>
                    <p className="text-primary-100 mt-2 text-sm">Creá tu cuenta gratuita</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Crear cuenta</h2>

                    {apiError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Nombre completo"
                            type="text"
                            placeholder="Juan García"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            error={errors.name}
                        />
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
                            placeholder="Mínimo 6 caracteres"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            error={errors.password}
                        />
                        <Input
                            label="Confirmar contraseña"
                            type="password"
                            placeholder="Repetí tu contraseña"
                            value={form.confirm}
                            onChange={e => setForm({ ...form, confirm: e.target.value })}
                            error={errors.confirm}
                        />
                        <Button type="submit" loading={loading} className="mt-2">
                            Crear cuenta
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        ¿Ya tenés cuenta?{' '}
                        <Link to="/login" className="text-primary-600 font-medium hover:underline">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
