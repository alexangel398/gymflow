import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, changePassword, uploadAvatar } from '../../services/user.service'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'


const ROLE_LABELS = { admin: 'Administrador', trainer: 'Entrenador', member: 'Miembro' }
const ROLE_COLORS = {
    admin: 'bg-purple-100 text-purple-700',
    trainer: 'bg-blue-100   text-blue-700',
    member: 'bg-green-100  text-green-700',
}

const Profile = () => {
    const { user, login } = useAuth()

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
    })

    const [pwForm, setPwForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    //Estados para mensajes y errores
    const [errors, setErrors] = useState({})
    const [pwErrors, setPwErrors] = useState({})
    const [msg, setMsg] = useState('')
    const [pwMsg, setPwMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [pwLoading, setPwLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [avatarMsg, setAvatarMsg] = useState('')
    const [avatarPreview, setAvatarPreview] = useState(
        user?.avatar ? `http://localhost:5000${user.avatar}` : null
    )

    //handlers

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setAvatarLoading(true)
        setAvatarMsg('')
        try {
            const { data } = await uploadAvatar(user._id, file)
            setAvatarMsg('✅ Foto actualizada')
            // Actualizar preview local
            setAvatarPreview(URL.createObjectURL(file))
        } catch (err) {
            setAvatarMsg('❌ ' + (err.response?.data?.message || 'Error al subir imagen'))
        } finally {
            setAvatarLoading(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        const errs = {}
        if (!form.name.trim()) errs.name = 'El nombre es obligatorio'
        if (Object.keys(errs).length) return setErrors(errs)

        setLoading(true)
        setMsg('')
        try {
            await updateProfile(user._id, form)
            setMsg('✅ Perfil actualizado correctamente')
            setErrors({})
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.message || 'Error al actualizar'))
        } finally {
            setLoading(false)
        }
    }

    const handlePassword = async (e) => {
        e.preventDefault()
        const errs = {}
        if (!pwForm.currentPassword) errs.currentPassword = 'Campo obligatorio'
        if (pwForm.newPassword.length < 6) errs.newPassword = 'Mínimo 6 caracteres'
        if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'No coinciden'
        if (Object.keys(errs).length) return setPwErrors(errs)

        setPwLoading(true)
        setPwMsg('')
        try {
            await changePassword(user._id, {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            })
            setPwMsg('✅ Contraseña actualizada correctamente')
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setPwErrors({})
        } catch (err) {
            setPwMsg('❌ ' + (err.response?.data?.message || 'Error al cambiar contraseña'))
        } finally {
            setPwLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header del perfil */}
            <Card>
                <div className="flex items-center gap-5">

                    {/* Avatar con botón de upload */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary-700 text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                : user?.name?.charAt(0).toUpperCase()
                            }
                        </div>

                        {/* Botón cambiar foto */}
                        <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 hover:bg-primary-800
        rounded-full flex items-center justify-center cursor-pointer transition-colors shadow">
                            {avatarLoading
                                ? <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                : <span className="text-white text-xs">✎</span>
                            }
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={avatarLoading}
                            />
                        </label>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                        <p className="text-sm text-gray-400 mb-1">{user?.email}</p>
                        {avatarMsg && (
                            <p className={`text-xs ${avatarMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                                {avatarMsg}
                            </p>
                        )}
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${ROLE_COLORS[user?.role]}`}>
                            {ROLE_LABELS[user?.role]}
                        </span>
                    </div>

                </div>
            </Card>

            {/* Formulario de datos */}
            <Card title="Información Personal">
                {msg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${msg.startsWith('✅')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                        {msg}
                    </div>
                )}
                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        label="Nombre completo"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        error={errors.name}
                    />
                    <Input
                        label="Email"
                        value={user?.email}
                        disabled
                        className="opacity-60 cursor-not-allowed"
                    />
                    <Input
                        label="Teléfono"
                        type="tel"
                        placeholder="Ej: 1123456789"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        error={errors.phone}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                            rows={3}
                            maxLength={500}
                            placeholder="Contá algo sobre vos..."
                            value={form.bio}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                hover:border-gray-400 resize-none"
                        />
                        <p className="text-xs text-gray-400 text-right">{form.bio.length}/500</p>
                    </div>
                    <Button type="submit" loading={loading}>
                        Guardar cambios
                    </Button>
                </form>
            </Card>

            {/* Cambiar contraseña */}
            <Card title="Cambiar Contraseña">
                {pwMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${pwMsg.startsWith('✅')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                        {pwMsg}
                    </div>
                )}
                <form onSubmit={handlePassword} className="space-y-4">
                    <Input
                        label="Contraseña actual"
                        type="password"
                        placeholder="••••••••"
                        value={pwForm.currentPassword}
                        onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        error={pwErrors.currentPassword}
                    />
                    <Input
                        label="Nueva contraseña"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={pwForm.newPassword}
                        onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        error={pwErrors.newPassword}
                    />
                    <Input
                        label="Confirmar nueva contraseña"
                        type="password"
                        placeholder="Repetí la nueva contraseña"
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                        error={pwErrors.confirmPassword}
                    />
                    <Button type="submit" loading={pwLoading} variant="secondary">
                        Cambiar contraseña
                    </Button>
                </form>
            </Card>

            {/* Info de suscripción */}
            <Card title="Suscripción">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Plan actual</p>
                        <p className="text-lg font-semibold text-gray-800 capitalize">
                            {user?.subscription?.plan === 'none' ? 'Sin plan' : user?.subscription?.plan}
                        </p>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${user?.subscription?.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                        }`}>
                        {user?.subscription?.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
            </Card>

        </div>
    )
}

export default Profile