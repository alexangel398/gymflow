import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('gymflow_token'))
    const [loading, setLoading] = useState(true)

    // Al montar, verificar si hay sesión activa
    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('gymflow_token')
            if (savedToken) {
                try {
                    const { data } = await api.get('/auth/me')
                    setUser(data.user)
                } catch {
                    localStorage.removeItem('gymflow_token')
                    localStorage.removeItem('gymflow_user')
                    setToken(null)
                }
            }
            setLoading(false)
        }
        initAuth()
    }, [])

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('gymflow_token', data.token)
        setToken(data.token)
        setUser(data.user)
        return data.user
    }

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password })
        localStorage.setItem('gymflow_token', data.token)
        setToken(data.token)
        setUser(data.user)
        return data.user
    }

    const logout = () => {
        localStorage.removeItem('gymflow_token')
        localStorage.removeItem('gymflow_user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
    return context
}
