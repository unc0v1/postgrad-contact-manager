import { prisma } from '../config/database.js'
import { AppError } from '../middlewares/errorHandler.js'

interface ListParams {
  page: number
  pageSize: number
  search?: string
  status?: string
}

export class ProfessorService {
  /** 获取导师列表 */
  async list(userId: string, params: ListParams) {
    const { page, pageSize, search, status } = params
    const skip = (page - 1) * pageSize

    const where: any = { userId }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { university: { contains: search } },
        { college: { contains: search } },
        { researchArea: { contains: search } },
      ]
    }

    if (status) {
      where.contactStatus = status
    }

    const [data, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { priority: 'desc' },
          { updatedAt: 'desc' },
        ],
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              interviews: true,
              communications: true,
            },
          },
        },
      }),
      prisma.professor.count({ where }),
    ])

    return { data, total }
  }

  /** 获取导师详情 */
  async detail(id: string, userId: string) {
    return prisma.professor.findFirst({
      where: { id, userId },
      include: {
        tags: {
          include: { tag: true },
        },
        interviews: {
          orderBy: { scheduledAt: 'desc' },
        },
        communications: {
          orderBy: { sentAt: 'desc' },
        },
        statusLogs: {
          orderBy: { createdAt: 'desc' },
        },
        noteItems: {
          orderBy: { updatedAt: 'desc' },
        },
        reminders: {
          orderBy: { remindAt: 'asc' },
        },
      },
    })
  }

  /** 创建导师 */
  async create(userId: string, data: any) {
    return prisma.professor.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  /** 更新导师 */
  async update(id: string, userId: string, data: any) {
    const professor = await prisma.professor.findFirst({ where: { id, userId } })
    if (!professor) {
      throw new AppError('导师不存在', 404)
    }

    return prisma.professor.update({
      where: { id },
      data,
    })
  }

  /** 删除导师 */
  async remove(id: string, userId: string) {
    const professor = await prisma.professor.findFirst({ where: { id, userId } })
    if (!professor) {
      throw new AppError('导师不存在', 404)
    }

    return prisma.professor.delete({ where: { id } })
  }

  /** 更新联系状态 */
  async updateStatus(id: string, userId: string, status: string, remark?: string) {
    const professor = await prisma.professor.findFirst({ where: { id, userId } })
    if (!professor) {
      throw new AppError('导师不存在', 404)
    }

    // 记录状态变更日志
    await prisma.statusLog.create({
      data: {
        professorId: id,
        fromStatus: professor.contactStatus,
        toStatus: status,
        remark: remark || null,
      },
    })

    // 更新状态
    return prisma.professor.update({
      where: { id },
      data: { contactStatus: status },
    })
  }
}
