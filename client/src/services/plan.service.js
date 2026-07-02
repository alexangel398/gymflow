import api from './api'

export const getMyPlans = () => api.get('/plans/my')
export const getPlanById = (id) => api.get(`/plans/${id}`)
export const getPlans = (params) => api.get('/plans', { params })
export const deletePlan = (id) => api.delete(`/plans/${id}`)

export const createPlan = (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
            formData.append(key, typeof val === 'object' && !(val instanceof File)
                ? JSON.stringify(val)
                : val
            )
        }
    })
    return api.post('/plans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}