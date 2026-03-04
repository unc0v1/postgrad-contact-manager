import { z } from 'zod'

/** 注册参数校验 */
export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符'),
  nickname: z.string().min(1).max(50).optional(),
})

/** 登录参数校验 */
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})
