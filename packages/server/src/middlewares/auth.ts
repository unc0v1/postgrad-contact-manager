import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/token.js'

/** JWT 认证中间件 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    req.user = decoded as { id: string; email: string }
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证令牌无效或已过期',
    })
  }
}
