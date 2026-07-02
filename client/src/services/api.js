import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    },
});

// Interceptor: agregar token a cada request automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gymflow_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: manejar errores globales
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('gymflow_token');
            localStorage.removeItem('gymflow_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;