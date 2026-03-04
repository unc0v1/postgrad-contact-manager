import { prisma } from '../config/database.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/token.js'
import { AppError } from '../middlewares/errorHandler.js'

export class AuthService {
  /** 用户注册 */
  async register(email: string, password: string, nickname?: string) {
    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new AppError('该邮箱已被注册', 409)
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname || null,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        createdAt: true,
      },
    })

    // 生成 token
    const token = generateToken({ id: user.id, email: user.email })

    return { user, token }
  }

  /** 用户登录 */
  async login(email: string, password: string) {
    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError('邮箱或密码错误', 401)
    }

    // 验证密码
    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      throw new AppError('邮箱或密码错误', 401)
    }

    // 生成 token
    const token = generateToken({ id: user.id, email: user.email })

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
      token,
    }
  }

  /** 根据 ID 获取用户信息 */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new AppError('用户不存在', 404)
    }

    return user
  }
}
