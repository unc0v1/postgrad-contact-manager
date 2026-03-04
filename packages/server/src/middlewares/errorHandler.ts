import { Request, Response, NextFunction } from 'express'

/** 自定义错误类 */
export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

/** 全局错误处理中间件 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('[错误]', err.message)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // Zod 校验错误
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: '参数校验失败',
      errors: (err as any).errors,
    })
  }

  // Prisma 错误
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: '数据库操作失败',
    })
  }

  // 未知错误
  return res.status(500).json({
    success: false,
    message: '服务器内部错误',
  })
}
