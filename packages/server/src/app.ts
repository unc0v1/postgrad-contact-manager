import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { registerRoutes } from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

// 加载环境变量
dotenv.config({ path: '../../.env' })

export function createApp() {
  const app = express()

  // 中间件
  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // 注册路由
  registerRoutes(app)

  // 全局错误处理
  app.use(errorHandler)

  return app
}
