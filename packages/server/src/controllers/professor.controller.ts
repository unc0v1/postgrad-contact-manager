import { Request, Response, NextFunction } from 'express'
import { ProfessorService } from '../services/professor.service.js'
import { success, error, paginate } from '../utils/response.js'

const professorService = new ProfessorService()

export class ProfessorController {
  /** 获取导师列表 */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 20
      const search = req.query.search as string | undefined
      const status = req.query.status as string | undefined

      const { data, total } = await professorService.list(userId, { page, pageSize, search, status })
      return paginate(res, data, total, page, pageSize)
    } catch (err) {
      next(err)
    }
  }

  /** 获取导师详情 */
  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const professor = await professorService.detail(id, userId)
      if (!professor) {
        return error(res, '导师不存在', 404)
      }
      return success(res, professor)
    } catch (err) {
      next(err)
    }
  }

  /** 创建导师 */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const professor = await professorService.create(userId, req.body)
      return success(res, professor, '创建成功')
    } catch (err) {
      next(err)
    }
  }

  /** 更新导师 */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const professor = await professorService.update(id, userId, req.body)
      return success(res, professor, '更新成功')
    } catch (err) {
      next(err)
    }
  }

  /** 删除导师 */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      await professorService.remove(id, userId)
      return success(res, null, '删除成功')
    } catch (err) {
      next(err)
    }
  }

  /** 更新联系状态 */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const { status, remark } = req.body
      const professor = await professorService.updateStatus(id, userId, status, remark)
      return success(res, professor, '状态更新成功')
    } catch (err) {
      next(err)
    }
  }
}
