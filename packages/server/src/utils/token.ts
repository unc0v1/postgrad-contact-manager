import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'

interface TokenPayload {
  id: string
  email: string
}

/** 生成 JWT */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions)
}

/** 验证 JWT */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload
}
