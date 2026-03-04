import { request } from './request'

/** 认证相关 API */
export const authApi = {
  login: (data: { email: string; password: string }) =>
    request.post('/api/auth/login', data),
  register: (data: { email: string; password: string; nickname?: string }) =>
    request.post('/api/auth/register', data),
  me: () => request.get('/api/auth/me'),
}

/** 导师相关 API */
export const professorApi = {
  list: (params?: Record<string, any>) =>
    request.get('/api/professors', { params }),
  detail: (id: string) =>
    request.get(`/api/professors/${id}`),
  create: (data: Record<string, any>) =>
    request.post('/api/professors', data),
  update: (id: string, data: Record<string, any>) =>
    request.put(`/api/professors/${id}`, data),
  remove: (id: string) =>
    request.delete(`/api/professors/${id}`),
  updateStatus: (id: string, status: string, remark?: string) =>
    request.patch(`/api/professors/${id}/status`, { status, remark }),
}

export { request }
