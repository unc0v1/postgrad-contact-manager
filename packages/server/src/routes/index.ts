import { Express } from 'express'
import { authRoutes } from './auth.routes.js'
import { professorRoutes } from './professor.routes.js'

/** 注册所有路由 */
export function registerRoutes(app: Express) {
  app.use('/api/auth', authRoutes)
  app.use('/api/professors', professorRoutes)

  // 健康检查
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
}
