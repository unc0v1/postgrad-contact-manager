import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '@/api/request'

interface UserInfo {
  id: string
  email: string
  nickname: string | null
  avatar: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  /** 设置 token */
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /** 清除认证信息 */
  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  /** 登录 */
  async function login(email: string, password: string) {
    const res = await request.post('/api/auth/login', { email, password })
    setToken(res.data.data.token)
    user.value = res.data.data.user
    return res.data
  }

  /** 注册 */
  async function register(email: string, password: string, nickname?: string) {
    const res = await request.post('/api/auth/register', { email, password, nickname })
    setToken(res.data.data.token)
    user.value = res.data.data.user
    return res.data
  }

  /** 获取当前用户信息 */
  async function fetchUser() {
    try {
      const res = await request.get('/api/auth/me')
      user.value = res.data.data
      return res.data
    } catch {
      clearAuth()
      throw new Error('获取用户信息失败')
    }
  }

  /** 登出 */
  function logout() {
    clearAuth()
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    fetchUser,
    logout,
    setToken,
    clearAuth,
  }
})
