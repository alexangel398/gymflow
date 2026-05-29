import api from './api'

export const getProfile = (id)          => api.get(`/users/${id}`)
export const updateProfile = (id, data) => api.put(`/users/${id}`, data)
export const changePassword = (id, data) => api.put(`/users/${id}/password`, data)