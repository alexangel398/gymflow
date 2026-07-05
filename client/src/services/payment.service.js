import api from './api'

export const getPlans = () => api.get('/payments/plans')
export const getMyPayments = () => api.get('/payments/my')
export const getPayments = (params) => api.get('/payments', { params })
export const createCheckout = (planId) => api.post('/payments/create-checkout', { planId })
export const verifyPayment = (sessionId) => api.post('/payments/verify', { sessionId })