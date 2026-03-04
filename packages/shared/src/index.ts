// 常量导出
export {
  ContactStatus,
  ContactStatusLabel,
  InterviewStatus,
  InterviewStatusLabel,
  InterviewMethod,
  InterviewMethodLabel,
  ProfessorTitle,
  ProfessorTitleLabel,
  SchoolRating,
  SchoolRatingLabel,
  ReminderType,
  ReminderTypeLabel,
  TemplateCategory,
  TemplateCategoryLabel,
} from './constants/status.js'

// 类型导出
export type {
  ContactStatusType,
  InterviewStatusType,
  InterviewMethodType,
  ProfessorTitleType,
  SchoolRatingType,
  ReminderTypeValue,
  TemplateCategoryType,
} from './constants/status.js'

// 共享类型导出
export type {
  User,
  Professor,
  Interview,
  InterviewLog,
  Tag,
  EmailTemplate,
  Reminder,
  Note,
  StatusLog,
  Communication,
  ApiResponse,
  PaginatedResponse,
} from './types/index.js'
