import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

/** Zod 校验中间件工厂 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source])
      req[source] = data
      next()
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: '参数校验失败',
        errors: error.errors?.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      })
    }
  }
}
