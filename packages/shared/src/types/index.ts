/** 用户信息 */
export interface User {
  id: string
  email: string
  nickname: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
}

/** 导师信息 */
export interface Professor {
  id: string
  userId: string
  name: string
  university: string
  college: string
  title: string
  researchArea: string
  email: string | null
  phone: string | null
  homepage: string | null
  wechat: string | null
  schoolRating: string | null
  reputationScore: number | null
  reputationComment: string | null
  contactStatus: string
  priority: number
  source: string | null
  enrollmentQuota: number | null
  acceptingStudents: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** 面试信息 */
export interface Interview {
  id: string
  professorId: string
  scheduledAt: string
  duration: number | null
  method: string
  location: string | null
  meetingLink: string | null
  status: string
  preparationNotes: string | null
  createdAt: string
  updatedAt: string
}

/** 面试记录 */
export interface InterviewLog {
  id: string
  interviewId: string
  content: string
  selfRating: number | null
  mood: string | null
  questionsAsked: string | null
  keyTakeaways: string | null
  createdAt: string
  updatedAt: string
}

/** 标签 */
export interface Tag {
  id: string
  userId: string
  name: string
  color: string
}

/** 邮件模板 */
export interface EmailTemplate {
  id: string
  userId: string
  name: string
  subject: string
  content: string
  category: string
  isPreset: boolean
  createdAt: string
  updatedAt: string
}

/** 提醒 */
export interface Reminder {
  id: string
  userId: string
  professorId: string | null
  title: string
  description: string | null
  remindAt: string
  type: string
  isCompleted: boolean
  createdAt: string
}

/** 笔记 */
export interface Note {
  id: string
  userId: string
  professorId: string | null
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

/** 状态变更日志 */
export interface StatusLog {
  id: string
  professorId: string
  fromStatus: string
  toStatus: string
  remark: string | null
  createdAt: string
}

/** 沟通记录 */
export interface Communication {
  id: string
  professorId: string
  type: string
  subject: string | null
  content: string | null
  sentAt: string
  isReplied: boolean
  repliedAt: string | null
  replyContent: string | null
}

/** API 统一响应格式 */
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

/** 分页响应格式 */
export interface PaginatedResponse<T = any> {
  success: boolean
  message: string
  data: {
    list: T[]
    pagination: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  }
}
