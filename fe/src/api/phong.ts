import api from './axios'

export interface Phong { _id: string; ten: string; createdAt: string }

export const getPhong = () => api.get<Phong[]>('/phong').then(r => r.data)
export const createPhong = (ten: string) => api.post<Phong>('/phong', { ten }).then(r => r.data)
export const updatePhong = (id: string, ten: string) => api.put<Phong>(`/phong/${id}`, { ten }).then(r => r.data)
export const deletePhong = (id: string) => api.delete(`/phong/${id}`).then(r => r.data)
