// ==================== 联系状态 ====================

/** 联系状态枚举 */
export const ContactStatus = {
  NOT_CONTACTED: 'NOT_CONTACTED',
  EMAIL_SENT: 'EMAIL_SENT',
  REPLIED: 'REPLIED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEWED: 'INTERVIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING',
} as const

export type ContactStatusType = typeof ContactStatus[keyof typeof ContactStatus]

/** 联系状态中文映射 */
export const ContactStatusLabel: Record<ContactStatusType, string> = {
  NOT_CONTACTED: '未联系',
  EMAIL_SENT: '已发邮件',
  REPLIED: '已回复',
  INTERVIEW_SCHEDULED: '面试已安排',
  INTERVIEWED: '已面试',
  ACCEPTED: '已接受',
  REJECTED: '已拒绝',
  PENDING: '待定',
}

// ==================== 面试状态 ====================

/** 面试状态枚举 */
export const InterviewStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type InterviewStatusType = typeof InterviewStatus[keyof typeof InterviewStatus]

/** 面试状态中文映射 */
export const InterviewStatusLabel: Record<InterviewStatusType, string> = {
  SCHEDULED: '已安排',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

// ==================== 面试方式 ====================

/** 面试方式枚举 */
export const InterviewMethod = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  PHONE: 'PHONE',
} as const

export type InterviewMethodType = typeof InterviewMethod[keyof typeof InterviewMethod]

/** 面试方式中文映射 */
export const InterviewMethodLabel: Record<InterviewMethodType, string> = {
  ONLINE: '线上面试',
  OFFLINE: '线下面试',
  PHONE: '电话面试',
}

// ==================== 导师职称 ====================

/** 导师职称枚举 */
export const ProfessorTitle = {
  ACADEMICIAN: 'ACADEMICIAN',
  PROFESSOR: 'PROFESSOR',
  ASSOCIATE_PROF: 'ASSOCIATE_PROF',
  LECTURER: 'LECTURER',
  RESEARCHER: 'RESEARCHER',
  ASSOC_RESEARCHER: 'ASSOC_RESEARCHER',
  OTHER: 'OTHER',
} as const

export type ProfessorTitleType = typeof ProfessorTitle[keyof typeof ProfessorTitle]

/** 导师职称中文映射 */
export const ProfessorTitleLabel: Record<ProfessorTitleType, string> = {
  ACADEMICIAN: '院士',
  PROFESSOR: '教授',
  ASSOCIATE_PROF: '副教授',
  LECTURER: '讲师',
  RESEARCHER: '研究员',
  ASSOC_RESEARCHER: '副研究员',
  OTHER: '其他',
}

// ==================== 学校评级 ====================

/** 学校评级枚举 */
export const SchoolRating = {
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const

export type SchoolRatingType = typeof SchoolRating[keyof typeof SchoolRating]

/** 学校评级中文映射 */
export const SchoolRatingLabel: Record<SchoolRatingType, string> = {
  S: 'S档 (顶尖985)',
  A: 'A档 (优秀985)',
  B: 'B档 (一般985/顶尖211)',
  C: 'C档 (一般211)',
  D: 'D档 (双非院校)',
}

// ==================== 提醒类型 ====================

/** 提醒类型枚举 */
export const ReminderType = {
  FOLLOW_UP: 'FOLLOW_UP',
  INTERVIEW: 'INTERVIEW',
  DEADLINE: 'DEADLINE',
  CUSTOM: 'CUSTOM',
} as const

export type ReminderTypeValue = typeof ReminderType[keyof typeof ReminderType]

/** 提醒类型中文映射 */
export const ReminderTypeLabel: Record<ReminderTypeValue, string> = {
  FOLLOW_UP: '跟进提醒',
  INTERVIEW: '面试提醒',
  DEADLINE: '截止日期',
  CUSTOM: '自定义提醒',
}

// ==================== 模板分类 ====================

/** 邮件模板分类枚举 */
export const TemplateCategory = {
  FIRST_CONTACT: 'FIRST_CONTACT',
  FOLLOW_UP: 'FOLLOW_UP',
  PRE_INTERVIEW: 'PRE_INTERVIEW',
  POST_INTERVIEW: 'POST_INTERVIEW',
  ACCEPT_OFFER: 'ACCEPT_OFFER',
  DECLINE_OFFER: 'DECLINE_OFFER',
} as const

export type TemplateCategoryType = typeof TemplateCategory[keyof typeof TemplateCategory]

/** 邮件模板分类中文映射 */
export const TemplateCategoryLabel: Record<TemplateCategoryType, string> = {
  FIRST_CONTACT: '初次联系',
  FOLLOW_UP: '后续跟进',
  PRE_INTERVIEW: '面试前',
  POST_INTERVIEW: '面试后',
  ACCEPT_OFFER: '接受录取',
  DECLINE_OFFER: '婉拒录取',
}
