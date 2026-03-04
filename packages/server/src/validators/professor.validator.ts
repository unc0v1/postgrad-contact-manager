import { z } from 'zod'

/** 创建导师参数校验 */
export const createProfessorSchema = z.object({
  name: z.string().min(1, '请输入导师姓名').max(50),
  university: z.string().min(1, '请输入学校名称').max(100),
  college: z.string().min(1, '请输入学院名称').max(100),
  title: z.string().default('PROFESSOR'),
  researchArea: z.string().min(1, '请输入研究方向').max(500),
  email: z.string().email('请输入有效的邮箱').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  homepage: z.string().url('请输入有效的网址').optional().nullable(),
  wechat: z.string().max(50).optional().nullable(),
  schoolRating: z.string().default('B'),
  reputationScore: z.number().int().min(0).max(100).optional().nullable(),
  reputationComment: z.string().max(500).optional().nullable(),
  contactStatus: z.string().default('NOT_CONTACTED'),
  priority: z.number().int().min(0).max(10).default(0),
  source: z.string().max(200).optional().nullable(),
  enrollmentQuota: z.number().int().min(0).optional().nullable(),
  acceptingStudents: z.boolean().default(true),
  notes: z.string().max(2000).optional().nullable(),
})

/** 更新导师参数校验 */
export const updateProfessorSchema = createProfessorSchema.partial()

/** 状态变更参数校验 */
export const updateStatusSchema = z.object({
  status: z.string().min(1, '请选择状态'),
  remark: z.string().max(500).optional(),
})
