import api from './api'

export const getProfile = (id) => api.get(`/users/${id}`)
export const updateProfile = (id, data) => api.put(`/users/${id}`, data)
export const changePassword = (id, data) => api.put(`/users/${id}/password`, data)

export const uploadAvatar = (id, file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post(`/users/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}