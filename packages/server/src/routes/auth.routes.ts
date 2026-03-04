import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { loginSchema, registerSchema } from '../validators/auth.validator.js'

const router = Router()
const controller = new AuthController()

/** POST /api/auth/register - 用户注册 */
router.post('/register', validate(registerSchema), controller.register)

/** POST /api/auth/login - 用户登录 */
router.post('/login', validate(loginSchema), controller.login)

/** GET /api/auth/me - 获取当前用户信息 */
router.get('/me', authMiddleware, controller.me)

export { router as authRoutes }
