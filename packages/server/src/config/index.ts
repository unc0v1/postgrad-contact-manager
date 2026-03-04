import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export const config = {
  /** 服务端口 */
  port: parseInt(process.env.PORT || '3000', 10),

  /** 数据库连接地址 */
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',

  /** JWT 密钥 */
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',

  /** JWT 过期时间 */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
}
