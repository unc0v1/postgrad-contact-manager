import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service.js'
import { success, error } from '../utils/response.js'

const authService = new AuthService()

export class AuthController {
  /** 用户注册 */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, nickname } = req.body
      const result = await authService.register(email, password, nickname)
      return success(res, result, '注册成功')
    } catch (err: any) {
      if (err.message === '该邮箱已被注册') {
        return error(res, err.message, 409)
      }
      next(err)
    }
  }

  /** 用户登录 */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      return success(res, result, '登录成功')
    } catch (err: any) {
      if (err.message === '邮箱或密码错误') {
        return error(res, err.message, 401)
      }
      next(err)
    }
  }

  /** 获取当前用户信息 */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const user = await authService.getUserById(userId)
      return success(res, user)
    } catch (err) {
      next(err)
    }
  }
}
