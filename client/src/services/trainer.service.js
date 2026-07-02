import api from './api'

export const getTrainers       = (params)        => api.get('/trainers', { params })
export const getTrainerById    = (id)             => api.get(`/trainers/${id}`)
export const createTrainer     = (data)           => api.post('/trainers', data)
export const updateTrainer     = (id, data)       => api.put(`/trainers/${id}`, data)
export const getAssignedMembers= (id)             => api.get(`/trainers/${id}/members`)
export const assignMember      = (tid, mid)       => api.post(`/trainers/${tid}/assign/${mid}`)
export const unassignMember    = (tid, mid)       => api.delete(`/trainers/${tid}/assign/${mid}`)