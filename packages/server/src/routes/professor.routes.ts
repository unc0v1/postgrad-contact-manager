import { Router } from 'express'
import { ProfessorController } from '../controllers/professor.controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { createProfessorSchema, updateProfessorSchema, updateStatusSchema } from '../validators/professor.validator.js'

const router = Router()
const controller = new ProfessorController()

// 所有导师路由需要认证
router.use(authMiddleware)

/** GET /api/professors - 获取导师列表 */
router.get('/', controller.list)

/** GET /api/professors/:id - 获取导师详情 */
router.get('/:id', controller.detail)

/** POST /api/professors - 创建导师 */
router.post('/', validate(createProfessorSchema), controller.create)

/** PUT /api/professors/:id - 更新导师 */
router.put('/:id', validate(updateProfessorSchema), controller.update)

/** DELETE /api/professors/:id - 删除导师 */
router.delete('/:id', controller.remove)

/** PATCH /api/professors/:id/status - 更新联系状态 */
router.patch('/:id/status', validate(updateStatusSchema), controller.updateStatus)

export { router as professorRoutes }
