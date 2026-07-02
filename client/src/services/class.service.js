import api from './api'

export const getClasses    = (params) => api.get('/classes', { params })
export const getClassById  = (id)     => api.get(`/classes/${id}`)
export const getMyClasses  = ()       => api.get('/classes/my')
export const createClass   = (data)   => api.post('/classes', data)
export const updateClass   = (id, data) => api.put(`/classes/${id}`, data)
export const deleteClass   = (id)     => api.delete(`/classes/${id}`)
export const enrollClass   = (id)     => api.post(`/classes/${id}/enroll`)
export const unenrollClass = (id)     => api.delete(`/classes/${id}/enroll`)