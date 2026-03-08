<template>
  <div class="app-page professor-detail-page">
    <n-card class="app-card detail-hero-card">
      <n-page-header @back="handleBack">
        <template #title>
          {{ professor?.name || '导师详情' }}
        </template>
        <template #subtitle>
          <div class="detail-subtitle">
            <span>{{ professorSubtitle }}</span>
            <n-tag :type="currentStatusConfig.type" size="small" :bordered="false">
              {{ currentStatusConfig.label }}
            </n-tag>
          </div>
        </template>
        <template #extra>
          <div class="detail-hero-actions">
            <n-button @click="handleCreateNote">
              新建笔记
            </n-button>
            <n-button @click="handleEdit">
              编辑
            </n-button>
            <n-button type="primary" @click="openStatusModal">
              更改状态
            </n-button>
          </div>
        </template>
      </n-page-header>
    </n-card>

    <n-spin :show="loading">
      <template v-if="professor">
        <n-grid cols="1 s:2 m:4" responsive="screen" :x-gap="16" :y-gap="16">
          <n-gi>
            <n-card size="small" class="app-card metric-card" :bordered="false">
              <div class="metric-card__label">面试场次</div>
              <div class="metric-card__value">{{ interviews.length }}</div>
              <div class="metric-card__hint">已同步到导师维度</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card size="small" class="app-card metric-card" :bordered="false">
              <div class="metric-card__label">面试日志</div>
              <div class="metric-card__value">{{ totalInterviewLogs }}</div>
              <div class="metric-card__hint">按时间倒序展示</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card size="small" class="app-card metric-card" :bordered="false">
              <div class="metric-card__label">沟通记录</div>
              <div class="metric-card__value">{{ communications.length }}</div>
              <div class="metric-card__hint">邮件与回复状态联动</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card size="small" class="app-card metric-card" :bordered="false">
              <div class="metric-card__label">关联笔记</div>
              <div class="metric-card__value">{{ noteItems.length }}</div>
              <div class="metric-card__hint">支持直接跳转编辑</div>
            </n-card>
          </n-gi>
        </n-grid>

        <div class="detail-layout">
          <div class="detail-main">
            <n-card title="基础信息" class="app-card">
              <n-descriptions :column="2" bordered label-placement="left">
                <n-descriptions-item label="研究方向">
                  {{ displayValue(professor.researchArea) }}
                </n-descriptions-item>
                <n-descriptions-item label="邮箱">
                  {{ displayValue(professor.email) }}
                </n-descriptions-item>
                <n-descriptions-item label="电话">
                  {{ displayValue(professor.phone) }}
                </n-descriptions-item>
                <n-descriptions-item label="主页">
                  <a v-if="professor.homepage" :href="professor.homepage" target="_blank" rel="noopener noreferrer">
                    {{ professor.homepage }}
                  </a>
                  <span v-else>-</span>
                </n-descriptions-item>
                <n-descriptions-item label="微信">
                  {{ displayValue(professor.wechat) }}
                </n-descriptions-item>
                <n-descriptions-item label="院校评级">
                  {{ displayValue(professor.schoolRating) }}
                </n-descriptions-item>
                <n-descriptions-item label="是否招生">
                  {{ professor.acceptingStudents ? '是' : '否' }}
                </n-descriptions-item>
                <n-descriptions-item label="招生名额">
                  {{ displayValue(professor.enrollmentQuota) }}
                </n-descriptions-item>
                <n-descriptions-item label="信息来源">
                  {{ displayValue(professor.source) }}
                </n-descriptions-item>
              </n-descriptions>
            </n-card>

            <n-card class="app-card detail-record-card">
              <template #header>
                <div class="detail-record-card__header">
                  <div>
                    <div class="detail-record-card__title">关联记录</div>
                    <div class="detail-record-card__subtitle">这里展示导师下的面试、沟通与笔记，不再是空占位。</div>
                  </div>
                </div>
              </template>
              <template #header-extra>
                <n-space :size="8" :wrap="true">
                  <n-button quaternary @click="handleGoToInterviewPage">
                    前往面试管理
                  </n-button>
                  <n-button quaternary @click="handleGoToNotesPage">
                    查看全部笔记
                  </n-button>
                </n-space>
              </template>

              <n-tabs type="line" animated>
                <n-tab-pane :name="'interview-records'" :tab="`面试记录 ${interviews.length}`">
                  <n-empty v-if="interviews.length === 0" description="暂无面试记录" class="app-empty" />
                  <div v-else class="record-stack">
                    <n-card
                      v-for="interview in interviews"
                      :key="interview.id"
                      size="small"
                      class="record-item-card"
                    >
                      <template #header>
                        <div class="record-item-card__title">
                          <span>{{ formatDateTime(interview.scheduledAt) }}</span>
                          <span class="record-item-card__subtitle">
                            {{ getInterviewMethodLabel(interview.method) }}
                            <template v-if="interview.duration"> · {{ interview.duration }} 分钟</template>
                          </span>
                        </div>
                      </template>
                      <template #header-extra>
                        <n-tag :type="getInterviewStatusConfig(interview.status).type" :bordered="false">
                          {{ getInterviewStatusConfig(interview.status).label }}
                        </n-tag>
                      </template>

                      <div class="record-item-grid">
                        <div>
                          <div class="record-item-grid__label">面试方式</div>
                          <div>{{ getInterviewMethodLabel(interview.method) }}</div>
                        </div>
                        <div>
                          <div class="record-item-grid__label">会议信息</div>
                          <div>
                            <a
                              v-if="interview.meetingLink"
                              :href="interview.meetingLink"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {{ interview.meetingLink }}
                            </a>
                            <span v-else>{{ displayValue(interview.location) }}</span>
                          </div>
                        </div>
                      </div>

                      <div v-if="interview.preparationNotes" class="record-item-section">
                        <div class="record-item-section__label">准备备注</div>
                        <div>{{ interview.preparationNotes }}</div>
                      </div>

                      <div class="record-item-section">
                        <div class="record-item-section__label">面试日志</div>
                        <n-empty v-if="interview.logs.length === 0" size="small" description="该场面试还没有日志" />
                        <div v-else class="log-stack">
                          <div v-for="log in interview.logs" :key="log.id" class="log-item">
                            <div class="log-item__header">
                              <span>{{ formatDateTime(log.createdAt) }}</span>
                              <n-space :size="8" :wrap="true">
                                <n-tag v-if="log.selfRating" size="small" :bordered="false" type="warning">
                                  自评 {{ log.selfRating }}/5
                                </n-tag>
                                <n-tag v-if="log.mood" size="small" :bordered="false">
                                  {{ log.mood }}
                                </n-tag>
                              </n-space>
                            </div>
                            <div class="log-item__content">{{ log.content }}</div>
                            <div v-if="log.questionsAsked" class="log-item__meta">
                              <span class="log-item__meta-label">被问问题</span>
                              <span>{{ log.questionsAsked }}</span>
                            </div>
                            <div v-if="log.keyTakeaways" class="log-item__meta">
                              <span class="log-item__meta-label">关键收获</span>
                              <span>{{ log.keyTakeaways }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </n-card>
                  </div>
                </n-tab-pane>

                <n-tab-pane :name="'communication-records'" :tab="`沟通记录 ${communications.length}`">
                  <n-empty v-if="communications.length === 0" description="暂无沟通记录" class="app-empty" />
                  <div v-else class="record-stack">
                    <n-card
                      v-for="item in communications"
                      :key="item.id"
                      size="small"
                      class="record-item-card"
                    >
                      <template #header>
                        <div class="record-item-card__title">
                          <span>{{ getCommunicationTypeLabel(item.type) }}</span>
                          <span class="record-item-card__subtitle">{{ formatDateTime(item.sentAt) }}</span>
                        </div>
                      </template>
                      <template #header-extra>
                        <n-tag :type="item.isReplied ? 'success' : 'default'" :bordered="false">
                          {{ item.isReplied ? '已回复' : '待回复' }}
                        </n-tag>
                      </template>

                      <div class="record-item-section">
                        <div class="record-item-section__label">主题</div>
                        <div>{{ displayValue(item.subject) }}</div>
                      </div>

                      <div class="record-item-section">
                        <div class="record-item-section__label">沟通内容</div>
                        <div>{{ displayValue(item.content) }}</div>
                      </div>

                      <div v-if="item.replyContent || item.repliedAt" class="record-item-section">
                        <div class="record-item-section__label">回复情况</div>
                        <div class="record-item-reply">
                          <div>回复时间：{{ item.repliedAt ? formatDateTime(item.repliedAt) : '-' }}</div>
                          <div>回复内容：{{ displayValue(item.replyContent) }}</div>
                        </div>
                      </div>
                    </n-card>
                  </div>
                </n-tab-pane>

                <n-tab-pane :name="'note-items'" :tab="`关联笔记 ${noteItems.length}`">
                  <n-empty v-if="noteItems.length === 0" description="暂未关联笔记" class="app-empty" />
                  <div v-else class="note-stack">
                    <button
                      v-for="item in noteItems"
                      :key="item.id"
                      type="button"
                      class="note-link-card"
                      @click="handleOpenNote(item.id)"
                    >
                      <div class="note-link-card__head">
                        <span class="note-link-card__title">{{ item.title }}</span>
                        <span class="note-link-card__time">{{ formatDateTime(item.updatedAt) }}</span>
                      </div>
                      <div class="note-link-card__content">{{ getNotePreview(item.content) }}</div>
                    </button>
                  </div>
                </n-tab-pane>
              </n-tabs>
            </n-card>
          </div>

          <div class="detail-side">
            <n-card title="风评卡片" class="app-card side-card">
              <div class="reputation-panel">
                <div class="reputation-panel__score">
                  <n-rate :value="reputationScore" readonly />
                  <span>{{ reputationScore }} / 5</span>
                </div>
                <div class="reputation-panel__comment">
                  {{ displayValue(professor.reputationComment) }}
                </div>
              </div>
            </n-card>

            <n-card title="状态变更历史" class="app-card side-card">
              <n-timeline v-if="statusLogs.length > 0">
                <n-timeline-item
                  v-for="item in statusLogs"
                  :key="item.id"
                  :time="formatDateTime(item.createdAt)"
                  :title="`${getStatusConfig(item.fromStatus).label} → ${getStatusConfig(item.toStatus).label}`"
                  :content="item.remark || '无备注'"
                />
              </n-timeline>
              <n-empty v-else description="暂无状态变更记录" />
            </n-card>
          </div>
        </div>
      </template>
      <n-card v-else class="app-card">
        <n-empty description="暂无导师信息" />
      </n-card>
    </n-spin>
  </div>

  <n-modal
    v-model:show="statusModalVisible"
    preset="card"
    title="更改联系状态"
    style="width: 520px"
  >
    <div class="space-y-4">
      <div>
        <div class="mb-2">
          新状态
        </div>
        <n-select
          v-model:value="statusForm.status"
          :options="statusOptions"
          placeholder="请选择联系状态"
        />
      </div>
      <div>
        <div class="mb-2">
          备注
        </div>
        <n-input
          v-model:value="statusForm.remark"
          type="textarea"
          placeholder="请输入备注"
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button @click="statusModalVisible = false">
          取消
        </n-button>
        <n-button type="primary" :loading="statusSubmitting" @click="submitStatusChange">
          确认
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, type SelectOption } from 'naive-ui'
import { professorApi } from '@/api'

type TagType = 'default' | 'success' | 'info' | 'warning' | 'error'

type ContactStatus =
  | 'NOT_CONTACTED'
  | 'EMAIL_SENT'
  | 'REPLIED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEWED'
  | 'ACCEPTED'
  | 'REJECTED'

type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
type InterviewMethod = 'ONLINE' | 'OFFLINE' | 'PHONE'

interface StatusLogItem {
  id: string
  fromStatus: string
  toStatus: string
  remark: string | null
  createdAt: string
}

interface InterviewLogItem {
  id: string
  content: string
  selfRating: number | null
  mood: string | null
  questionsAsked: string | null
  keyTakeaways: string | null
  createdAt: string
}

interface InterviewItem {
  id: string
  scheduledAt: string
  duration: number | null
  method: string
  location: string | null
  meetingLink: string | null
  status: string
  preparationNotes: string | null
  logs: InterviewLogItem[]
}

interface CommunicationItem {
  id: string
  type: string
  subject: string | null
  content: string | null
  sentAt: string
  isReplied: boolean
  repliedAt: string | null
  replyContent: string | null
}

interface NoteItem {
  id: string
  title: string
  content: string
  updatedAt: string
}

interface ProfessorDetail {
  id: string
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
  source: string | null
  enrollmentQuota: number | null
  acceptingStudents: boolean
  statusLogs: StatusLogItem[]
  interviews: InterviewItem[]
  communications: CommunicationItem[]
  noteItems: NoteItem[]
}

const STATUS_CONFIG: Record<ContactStatus, { label: string; type: TagType }> = {
  NOT_CONTACTED: { label: '未联系', type: 'default' },
  EMAIL_SENT: { label: '已发邮件', type: 'info' },
  REPLIED: { label: '已回复', type: 'success' },
  INTERVIEW_SCHEDULED: { label: '已约面试', type: 'warning' },
  INTERVIEWED: { label: '已面试', type: 'warning' },
  ACCEPTED: { label: '已录取', type: 'success' },
  REJECTED: { label: '已拒绝', type: 'error' },
}

const INTERVIEW_STATUS_CONFIG: Record<InterviewStatus, { label: string; type: TagType }> = {
  SCHEDULED: { label: '待面试', type: 'warning' },
  COMPLETED: { label: '已完成', type: 'success' },
  CANCELLED: { label: '已取消', type: 'error' },
}

const INTERVIEW_METHOD_LABEL_MAP: Record<InterviewMethod, string> = {
  ONLINE: '线上面试',
  OFFLINE: '线下面试',
  PHONE: '电话面试',
}

const COMMUNICATION_TYPE_LABEL_MAP: Record<string, string> = {
  EMAIL: '邮件',
  PHONE: '电话',
  WECHAT: '微信',
  MEETING: '当面沟通',
}

const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const statusSubmitting = ref(false)
const statusModalVisible = ref(false)
const professor = ref<ProfessorDetail | null>(null)
const statusForm = reactive({
  status: '' as ContactStatus | '',
  remark: '',
})

const statusOptions: SelectOption[] = (Object.keys(STATUS_CONFIG) as ContactStatus[]).map((status) => ({
  label: STATUS_CONFIG[status].label,
  value: status,
}))

const professorId = computed(() => {
  const rawId = route.params.id
  if (Array.isArray(rawId)) {
    return rawId[0] ?? ''
  }
  return typeof rawId === 'string' ? rawId : ''
})

const professorSubtitle = computed(() => {
  if (!professor.value) {
    return '-'
  }

  return [professor.value.university, professor.value.college, professor.value.title]
    .filter((item) => Boolean(item))
    .join(' / ')
})

const currentStatusConfig = computed(() => getStatusConfig(professor.value?.contactStatus))

const reputationScore = computed(() => {
  const score = professor.value?.reputationScore ?? 0
  return Math.max(0, Math.min(5, score))
})

const statusLogs = computed(() => professor.value?.statusLogs ?? [])
const interviews = computed(() => professor.value?.interviews ?? [])
const communications = computed(() => professor.value?.communications ?? [])
const noteItems = computed(() => professor.value?.noteItems ?? [])
const totalInterviewLogs = computed(() => interviews.value.reduce((sum, item) => sum + item.logs.length, 0))

watch(
  professorId,
  () => {
    void loadProfessorDetail()
  },
  { immediate: true },
)

function handleBack() {
  router.back()
}

function handleEdit() {
  void router.push({ path: `/professors/${professorId.value}/edit` })
}

function handleCreateNote() {
  void router.push({ name: 'NoteCreate', query: { professorId: professorId.value } })
}

function handleGoToInterviewPage() {
  void router.push({ name: 'Interviews' })
}

function handleGoToNotesPage() {
  void router.push({ name: 'Notes' })
}

function handleOpenNote(noteId: string) {
  void router.push({ name: 'NoteEdit', params: { id: noteId } })
}

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return String(value)
}

function getStatusConfig(status: string | undefined) {
  if (!status) {
    return { label: '-', type: 'default' as TagType }
  }

  if (status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as ContactStatus]
  }

  return { label: status, type: 'default' as TagType }
}

function getInterviewStatusConfig(status: string | undefined) {
  if (!status) {
    return { label: '-', type: 'default' as TagType }
  }

  if (status in INTERVIEW_STATUS_CONFIG) {
    return INTERVIEW_STATUS_CONFIG[status as InterviewStatus]
  }

  return { label: status, type: 'default' as TagType }
}

function getInterviewMethodLabel(method: string | undefined) {
  if (!method) {
    return '-'
  }
  return INTERVIEW_METHOD_LABEL_MAP[method as InterviewMethod] ?? method
}

function getCommunicationTypeLabel(type: string | undefined) {
  if (!type) {
    return '-'
  }
  return COMMUNICATION_TYPE_LABEL_MAP[type] ?? type
}

function getNotePreview(content: string) {
  const text = content.trim().replace(/\s+/g, ' ')
  if (!text) {
    return '暂无正文内容'
  }
  if (text.length <= 120) {
    return text
  }
  return `${text.slice(0, 120)}...`
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleString('zh-CN', { hour12: false })
}

function openStatusModal() {
  if (!professor.value) {
    message.warning('请先加载导师信息')
    return
  }
  statusForm.status = (professor.value.contactStatus as ContactStatus) ?? 'NOT_CONTACTED'
  statusForm.remark = ''
  statusModalVisible.value = true
}

async function loadProfessorDetail() {
  if (!professorId.value) {
    professor.value = null
    return
  }

  loading.value = true
  try {
    const response = await professorApi.detail(professorId.value)
    professor.value = (response.data?.data ?? null) as ProfessorDetail | null
  } catch {
    professor.value = null
    message.error('加载导师详情失败')
  } finally {
    loading.value = false
  }
}

async function submitStatusChange() {
  if (!professorId.value) {
    message.error('导师 ID 无效')
    return
  }

  if (!statusForm.status) {
    message.warning('请选择新状态')
    return
  }

  statusSubmitting.value = true
  try {
    const remark = statusForm.remark.trim()
    await professorApi.updateStatus(professorId.value, statusForm.status, remark || undefined)
    message.success('状态更新成功')
    statusModalVisible.value = false
    await loadProfessorDetail()
  } catch {
    message.error('状态更新失败')
  } finally {
    statusSubmitting.value = false
  }
}
</script>

<style scoped>
.professor-detail-page {
  gap: 16px;
}

.detail-hero-card {
  border: 0;
}

.detail-hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.metric-card {
  min-height: 120px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.92)),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 55%);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

.metric-card__label {
  font-size: 13px;
  color: #64748b;
}

.metric-card__value {
  margin-top: 10px;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  color: #0f172a;
}

.metric-card__hint {
  margin-top: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.detail-main,
.detail-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-card {
  overflow: hidden;
}

.detail-record-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.detail-record-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.detail-record-card__subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.record-stack,
.note-stack,
.log-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
}

.record-item-card__title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 700;
  color: #0f172a;
}

.record-item-card__subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.record-item-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.record-item-grid__label,
.record-item-section__label,
.log-item__meta-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.record-item-section {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  line-height: 1.7;
}

.record-item-reply {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-item {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.82);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #475569;
}

.log-item__content {
  color: #0f172a;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-item__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #475569;
  font-size: 13px;
}

.note-link-card {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 18px;
  padding: 16px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.92));
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.note-link-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.36);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
}

.note-link-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.note-link-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.note-link-card__time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.note-link-card__content {
  margin-top: 10px;
  color: #475569;
  line-height: 1.7;
}

.reputation-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reputation-panel__score {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reputation-panel__comment {
  color: #334155;
  line-height: 1.8;
}

@media (max-width: 1180px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .record-item-grid {
    grid-template-columns: 1fr;
  }

  .note-link-card__head,
  .log-item__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
