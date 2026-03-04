import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'

/** 创建 axios 实例 */
export const request = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** 请求拦截器：自动附加 token */
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/** 响应拦截器：统一错误处理 */
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || '请求失败'

    if (status === 401) {
      // token 过期或无效，清除登录状态
      const authStore = useAuthStore()
      authStore.clearAuth()
      window.location.href = '/login'
    }

    console.error(`[API Error] ${status}: ${message}`)
    return Promise.reject(error)
  }
)
