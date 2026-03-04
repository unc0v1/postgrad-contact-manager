import { Response } from 'express'

/** 成功响应 */
export function success(res: Response, data: any = null, message: string = '操作成功') {
  return res.json({
    success: true,
    message,
    data,
  })
}

/** 错误响应 */
export function error(res: Response, message: string = '操作失败', statusCode: number = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

/** 分页响应 */
export function paginate(
  res: Response,
  data: any[],
  total: number,
  page: number,
  pageSize: number,
  message: string = '查询成功'
) {
  return res.json({
    success: true,
    message,
    data: {
      list: data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  })
}
