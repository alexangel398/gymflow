import api from './api'

export const getMyQR = () => api.get('/attendance/qr')
export const getMyAttendance = (params) => api.get('/attendance/my', { params })
export const getAttendance = (params) => api.get('/attendance', { params })
export const scanQR = (data) => api.post('/attendance/scan', data)
export const manualAttendance = (data) => api.post('/attendance/manual', data)
export const exportCSV = (params) => api.get('/attendance/export', {
    params,
    responseType: 'blob',
})