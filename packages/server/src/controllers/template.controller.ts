import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import type { Dirent } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, extname, relative, resolve } from 'node:path'
import { NextFunction, Request, Response } from 'express'
import JSZip from 'jszip'
import mammoth from 'mammoth'
import XLSX from 'xlsx'
import { prisma } from '../config/database.js'
import { errorResponse, successResponse } from '../utils/response.js'

interface TemplateBody {
  name?: unknown
  subject?: unknown
  content?: unknown
  category?: unknown
}

interface TemplateImportFolderBody {
  folderPath?: unknown
  recursive?: unknown
}

interface ImportedFile {
  absolutePath: string
  relativePath: string
  displayName: string
  extension: string
  previewContent: string
  category: string
  fileSize: number
  mimeType: string
}

interface TemplatePreviewPayload {
  mode: 'text' | 'markdown' | 'html' | 'pdf' | 'image' | 'download' | 'missing'
  content: string
  assetUrl: string | null
  notice: string | null
  mimeType: string | null
  originalFileName: string | null
  fileExtension: string | null
  sourceType: string
}

const STORAGE_ROOT = resolve(process.cwd(), 'storage', 'templates')
const MAX_IMPORT_FILES = 200
const MAX_IMPORT_DEPTH = 5
const MAX_TEXT_FILE_BYTES = 1024 * 1024
const MAX_PREVIEW_LENGTH = 3000
const MAX_SHEET_PREVIEW_ROWS = 40
const MAX_SHEET_PREVIEW_COLUMNS = 12

const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.json',
  '.yaml',
  '.yml',
  '.csv',
  '.log',
  '.rtf',
])

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown'])
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'])
const WORKBOOK_EXTENSIONS = new Set(['.xls', '.xlsx'])
const PREVIEWABLE_BINARY_EXTENSIONS = new Set([
  '.pdf',
  '.docx',
  '.xls',
  '.xlsx',
  '.pptx',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
])

/**
 * @description 将输入值转换为去空格字符串。
 * @param value 输入值
 * @returns 标准化字符串
 */
function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * @description 将输入值转换为必填非空字符串。
 * @param value 输入值
 * @returns 非空字符串，失败返回 null
 */
function toRequiredString(value: unknown): string | null {
  const text = toTrimmedString(value)
  return text ? text : null
}

/**
 * @description 将输入值转为布尔值。
 * @param value 输入值
 * @param fallback 默认值
 * @returns 布尔值
 */
function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return fallback
}

/**
 * @description 解析系统默认文档目录。
 * @returns 默认目录路径，解析失败返回 null
 */
function resolveSystemDefaultFolderPath(): string | null {
  const userProfile = toRequiredString(process.env.USERPROFILE)
  if (userProfile) {
    return resolve(userProfile, 'Documents')
  }

  const homePath = toRequiredString(process.env.HOME)
  if (homePath) {
    return resolve(homePath, 'Documents')
  }

  return null
}

/**
 * @description 截断字符串到指定长度。
 * @param value 原始字符串
 * @param maxLength 最大长度
 * @returns 截断后的字符串
 */
function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength)}\n...(内容已截断)`
}

/**
 * @description 根据路径文本推断文书分类。
 * @param filePath 文件路径文本
 * @returns 分类编码
 */
function inferCategoryByPath(filePath: string): string {
  const lowerPath = filePath.toLowerCase()

  if (lowerPath.includes('简历') || lowerPath.includes('resume') || lowerPath.includes('cv')) {
    return 'RESUME'
  }
  if (lowerPath.includes('成绩单') || lowerPath.includes('transcript') || lowerPath.includes('grade')) {
    return 'TRANSCRIPT'
  }
  if (
    lowerPath.includes('个人陈述') ||
    lowerPath.includes('personal statement') ||
    lowerPath.includes('ps')
  ) {
    return 'PERSONAL_STATEMENT'
  }
  if (lowerPath.includes('推荐信') || lowerPath.includes('recommendation')) {
    return 'RECOMMENDATION'
  }
  if (
    lowerPath.includes('证书') ||
    lowerPath.includes('奖项') ||
    lowerPath.includes('certificate') ||
    lowerPath.includes('award')
  ) {
    return 'CERTIFICATE'
  }
  return 'OTHER_DOC'
}

/**
 * @description 根据扩展名推断 MIME 类型。
 * @param extension 扩展名
 * @returns MIME 类型
 */
function guessMimeTypeByExtension(extension: string): string {
  const lowerExtension = extension.toLowerCase()
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.markdown': 'text/markdown; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.yaml': 'text/yaml; charset=utf-8',
    '.yml': 'text/yaml; charset=utf-8',
    '.csv': 'text/csv; charset=utf-8',
    '.log': 'text/plain; charset=utf-8',
    '.rtf': 'application/rtf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
  }

  return mimeMap[lowerExtension] || 'application/octet-stream'
}

/**
 * @description 对 HTML 特殊字符进行转义。
 * @param value 输入文本
 * @returns 转义后的文本
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * @description 解码 XML 常见实体。
 * @param value 原始文本
 * @returns 解码后的文本
 */
function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * @description 读取文本文件预览内容。
 * @param absolutePath 文件绝对路径
 * @returns 预览文本
 */
async function readTextPreview(absolutePath: string): Promise<string | null> {
  try {
    const fileStat = await stat(absolutePath)
    if (!fileStat.isFile()) {
      return null
    }
    if (fileStat.size > MAX_TEXT_FILE_BYTES) {
      return '文本文件较大，已跳过全文读取，请使用原文件查看完整内容。'
    }

    const content = await readFile(absolutePath, 'utf8')
    const trimmed = content.trim()
    if (!trimmed) {
      return '文件内容为空。'
    }
    return truncateText(trimmed, MAX_PREVIEW_LENGTH)
  } catch {
    return null
  }
}

/**
 * @description 生成导入后的内容摘要。
 * @param relativePath 相对路径
 * @param extension 扩展名
 * @param textPreview 文本预览
 * @returns 摘要文本
 */
function buildPreviewContent(relativePath: string, extension: string, textPreview: string | null): string {
  const header = `来源文件：${relativePath}`

  if (textPreview) {
    return `${header}\n\n${textPreview}`
  }

  const extensionText = extension || '未知类型'
  const previewHint = PREVIEWABLE_BINARY_EXTENSIONS.has(extension)
    ? '该文件已支持网页预览，可点击“打开”查看原文件内容。'
    : '该文件暂不支持结构化预览，可点击“打开原文件”下载查看。'
  return `${header}\n\n文件类型：${extensionText}\n提示：${previewHint}`
}

/**
 * @description 生成 PPTX 文本预览 HTML。
 * @param absolutePath 文件路径
 * @returns HTML 字符串
 */
async function buildPptxPreviewHtml(absolutePath: string): Promise<string> {
  const buffer = await readFile(absolutePath)
  const zip = await JSZip.loadAsync(buffer)
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((left, right) => {
      const leftNumber = Number.parseInt(left.match(/slide(\d+)\.xml/i)?.[1] || '0', 10)
      const rightNumber = Number.parseInt(right.match(/slide(\d+)\.xml/i)?.[1] || '0', 10)
      return leftNumber - rightNumber
    })

  if (slideNames.length === 0) {
    return '<p>未解析到可预览的幻灯片内容。</p>'
  }

  const sections = await Promise.all(slideNames.map(async (name, index) => {
    const xml = await zip.file(name)?.async('text')
    const textList = Array.from(xml?.matchAll(/<a:t>(.*?)<\/a:t>/g) ?? [])
      .map((item) => decodeXmlEntities(item[1] || '').trim())
      .filter((item) => item.length > 0)

    if (textList.length === 0) {
      return `<section class="preview-slide"><h3>第 ${index + 1} 页</h3><p>当前页未提取到文本内容。</p></section>`
    }

    return [
      `<section class="preview-slide">`,
      `<h3>第 ${index + 1} 页</h3>`,
      ...textList.map((item) => `<p>${escapeHtml(item)}</p>`),
      `</section>`,
    ].join('')
  }))

  return sections.join('')
}

/**
 * @description 生成 Excel 预览 HTML。
 * @param absolutePath 文件路径
 * @returns HTML 字符串
 */
function buildWorkbookPreviewHtml(absolutePath: string): string {
  const workbook = XLSX.readFile(absolutePath, { cellDates: true })
  const sections = workbook.SheetNames.slice(0, 5).map((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    const rows = (XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
    }) as Array<Array<string | number | boolean | null>>) ?? []
    const limitedRows = rows.slice(0, MAX_SHEET_PREVIEW_ROWS)
    const colCount = Math.max(
      1,
      ...limitedRows.map((row) => Math.min(row.length, MAX_SHEET_PREVIEW_COLUMNS))
    )

    const tableRows = limitedRows.length > 0
      ? limitedRows.map((row) => {
        const cells = Array.from({ length: colCount }, (_, index) => escapeHtml(String(row[index] ?? '')))
        return `<tr>${cells.map((cell) => `<td>${cell || '&nbsp;'}</td>`).join('')}</tr>`
      }).join('')
      : '<tr><td>当前工作表暂无数据。</td></tr>'

    const footer = rows.length > MAX_SHEET_PREVIEW_ROWS
      ? `<p class="preview-table__hint">仅预览前 ${MAX_SHEET_PREVIEW_ROWS} 行。</p>`
      : ''

    return [
      `<section class="preview-sheet">`,
      `<h3>${escapeHtml(sheetName)}</h3>`,
      `<div class="preview-table-wrap"><table><tbody>${tableRows}</tbody></table></div>`,
      footer,
      `</section>`,
    ].join('')
  })

  return sections.join('') || '<p>未解析到可预览的工作表内容。</p>'
}

/**
 * @description 根据文件生成结构化预览数据。
 * @param storagePath 原文件路径
 * @param extension 文件扩展名
 * @returns 预览模式与内容
 */
async function buildFilePreviewPayload(storagePath: string, extension: string): Promise<Pick<TemplatePreviewPayload, 'mode' | 'content'>> {
  const lowerExtension = extension.toLowerCase()

  if (lowerExtension === '.pdf') {
    return { mode: 'pdf', content: '' }
  }

  if (IMAGE_EXTENSIONS.has(lowerExtension)) {
    return { mode: 'image', content: '' }
  }

  if (TEXT_EXTENSIONS.has(lowerExtension)) {
    const textContent = await readTextPreview(storagePath)
    return {
      mode: MARKDOWN_EXTENSIONS.has(lowerExtension) ? 'markdown' : 'text',
      content: textContent || '文件内容为空。',
    }
  }

  if (lowerExtension === '.docx') {
    const result = await mammoth.convertToHtml({ path: storagePath })
    return {
      mode: 'html',
      content: result.value || '<p>未解析到可预览内容。</p>',
    }
  }

  if (WORKBOOK_EXTENSIONS.has(lowerExtension)) {
    return {
      mode: 'html',
      content: buildWorkbookPreviewHtml(storagePath),
    }
  }

  if (lowerExtension === '.pptx') {
    return {
      mode: 'html',
      content: await buildPptxPreviewHtml(storagePath),
    }
  }

  return {
    mode: 'download',
    content: '',
  }
}

/**
 * @description 按目录收集可导入文件。
 * @param rootPath 根目录绝对路径
 * @param recursive 是否递归
 * @returns 文件列表
 */
async function collectFilesForImport(rootPath: string, recursive: boolean): Promise<ImportedFile[]> {
  const result: ImportedFile[] = []
  const queue: Array<{ dir: string; depth: number }> = [{ dir: rootPath, depth: 0 }]

  while (queue.length > 0 && result.length < MAX_IMPORT_FILES) {
    const current = queue.shift()
    if (!current) {
      break
    }

    let entries: Dirent[]
    try {
      entries = await readdir(current.dir, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      if (result.length >= MAX_IMPORT_FILES) {
        break
      }

      const absolutePath = resolve(current.dir, entry.name)
      if (entry.isDirectory()) {
        if (recursive && current.depth < MAX_IMPORT_DEPTH) {
          queue.push({ dir: absolutePath, depth: current.depth + 1 })
        }
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      const extension = extname(entry.name).toLowerCase()
      const fileStat = await stat(absolutePath)
      const fileNameWithoutExt = extension
        ? entry.name.slice(0, entry.name.length - extension.length)
        : entry.name
      const displayName = fileNameWithoutExt.trim() || entry.name
      const relativePath = relative(rootPath, absolutePath).replace(/\\/g, '/') || entry.name
      const textPreview = TEXT_EXTENSIONS.has(extension)
        ? await readTextPreview(absolutePath)
        : null

      result.push({
        absolutePath,
        relativePath,
        displayName: truncateText(displayName, 60),
        extension,
        previewContent: buildPreviewContent(relativePath, extension, textPreview),
        category: inferCategoryByPath(`${relativePath} ${displayName}`),
        fileSize: fileStat.size,
        mimeType: guessMimeTypeByExtension(extension),
      })
    }
  }

  return result
}

/**
 * @description 判断路径是否位于托管上传目录内。
 * @param filePath 文件路径
 * @returns 是否托管目录
 */
function isManagedStoragePath(filePath: string): boolean {
  return resolve(filePath).startsWith(STORAGE_ROOT)
}

/**
 * @description 查找当前用户拥有的文书资料。
 * @param id 条目 ID
 * @param userId 用户 ID
 * @returns 文书条目
 */
async function findOwnedTemplate(id: string, userId: string) {
  return prisma.emailTemplate.findFirst({
    where: { id, userId },
  })
}

export class TemplateController {
  /** @description 获取文书资料列表 */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const { category } = req.query
      const templates = await prisma.emailTemplate.findMany({
        where: {
          userId: req.user.id,
          ...(category ? { category: String(category) } : {}),
        },
        orderBy: { updatedAt: 'desc' },
      })
      return successResponse(res, templates)
    } catch (err) {
      return next(err)
    }
  }

  /** @description 获取文书资料详情 */
  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const template = await findOwnedTemplate(String(req.params.id), req.user.id)
      if (!template) return errorResponse(res, '文书资料不存在', 404)
      return successResponse(res, template)
    } catch (err) {
      return next(err)
    }
  }

  /** @description 创建文本型文书资料 */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const body = req.body as TemplateBody
      const name = toRequiredString(body.name)
      const subject = toTrimmedString(body.subject)
      const content = toTrimmedString(body.content)
      const category = toTrimmedString(body.category) || 'OTHER_DOC'

      if (!name) {
        return errorResponse(res, 'name 不能为空', 400)
      }
      if (!subject && !content) {
        return errorResponse(res, '文件路径/链接 与 内容摘要不能同时为空', 400)
      }

      const template = await prisma.emailTemplate.create({
        data: {
          userId: req.user.id,
          name,
          subject,
          content,
          category,
          sourceType: 'MANUAL',
        },
      })
      return successResponse(res, template, '创建成功')
    } catch (err) {
      return next(err)
    }
  }

  /** @description 上传本地文书原文件 */
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      if (!req.file) return errorResponse(res, '请选择要上传的文件', 400)

      const originalFileName = req.file.originalname || '未命名文书'
      const extension = extname(originalFileName).toLowerCase()
      const fileName = (basename(originalFileName, extension).trim() || '未命名文书').slice(0, 60)
      const relativePath = toTrimmedString(req.body.relativePath) || originalFileName
      const category = toTrimmedString(req.body.category) || inferCategoryByPath(`${relativePath} ${originalFileName}`)
      const targetDir = resolve(STORAGE_ROOT, req.user.id)
      await mkdir(targetDir, { recursive: true })

      const storedFileName = `${Date.now()}-${randomUUID()}${extension}`
      const storagePath = resolve(targetDir, storedFileName)
      await writeFile(storagePath, req.file.buffer)

      const textPreview = TEXT_EXTENSIONS.has(extension)
        ? await readTextPreview(storagePath)
        : null

      const template = await prisma.emailTemplate.create({
        data: {
          userId: req.user.id,
          name: fileName,
          subject: relativePath.replace(/\\/g, '/'),
          content: buildPreviewContent(relativePath.replace(/\\/g, '/'), extension, textPreview),
          category,
          sourceType: 'FILE_UPLOAD',
          storagePath,
          mimeType: req.file.mimetype || guessMimeTypeByExtension(extension),
          fileSize: req.file.size,
          fileExtension: extension || null,
          originalFileName,
        },
      })

      return successResponse(res, template, '上传成功')
    } catch (err) {
      return next(err)
    }
  }

  /** @description 批量从本地目录导入文书 */
  async importFolder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const userId = req.user.id

      const body = req.body as TemplateImportFolderBody
      const folderPathInput = toTrimmedString(body.folderPath)
      const recursive = toBoolean(body.recursive, true)
      const folderPath = folderPathInput
        ? resolve(folderPathInput)
        : resolveSystemDefaultFolderPath()
      if (!folderPath) {
        return errorResponse(res, 'folderPath 为空且系统默认文档目录不可用', 400)
      }

      let folderStat: Awaited<ReturnType<typeof stat>>
      try {
        folderStat = await stat(folderPath)
      } catch {
        return errorResponse(res, '目录不存在或不可访问', 400)
      }

      if (!folderStat.isDirectory()) {
        return errorResponse(res, 'folderPath 必须是目录', 400)
      }

      const files = await collectFilesForImport(folderPath, recursive)
      if (files.length === 0) {
        return successResponse(
          res,
          {
            folderPath,
            recursive,
            scannedCount: 0,
            createdCount: 0,
            duplicateCount: 0,
            reachedLimit: false,
          },
          '目录中未发现可导入文件'
        )
      }

      const requestPathSet = new Set<string>()
      const deduplicatedFiles: ImportedFile[] = []
      let duplicateInRequest = 0

      for (const item of files) {
        if (requestPathSet.has(item.relativePath)) {
          duplicateInRequest += 1
          continue
        }
        requestPathSet.add(item.relativePath)
        deduplicatedFiles.push(item)
      }

      const existingRows = await prisma.emailTemplate.findMany({
        where: {
          userId,
          subject: {
            in: deduplicatedFiles.flatMap((item) => [item.relativePath, `本地文件/${item.relativePath}`, item.absolutePath]),
          },
        },
        select: {
          subject: true,
        },
      })
      const existingPathSet = new Set(existingRows.map((item) => item.subject.replace(/^本地文件\//, '').replace(/\\/g, '/')))

      const createData = deduplicatedFiles
        .filter((item) => !existingPathSet.has(item.relativePath))
        .map((item) => ({
          userId,
          name: item.displayName,
          subject: item.relativePath,
          content: item.previewContent,
          category: item.category,
          sourceType: 'FILE_LINK',
          storagePath: item.absolutePath,
          mimeType: item.mimeType,
          fileSize: item.fileSize,
          fileExtension: item.extension || null,
          originalFileName: basename(item.absolutePath),
        }))

      if (createData.length > 0) {
        await prisma.emailTemplate.createMany({ data: createData })
      }

      const duplicateInDatabase = deduplicatedFiles.length - createData.length
      return successResponse(
        res,
        {
          folderPath,
          recursive,
          scannedCount: files.length,
          createdCount: createData.length,
          duplicateCount: duplicateInRequest + duplicateInDatabase,
          reachedLimit: files.length >= MAX_IMPORT_FILES,
          maxImportFiles: MAX_IMPORT_FILES,
        },
        createData.length > 0 ? '目录导入完成' : '没有新增文书资料'
      )
    } catch (err) {
      return next(err)
    }
  }

  /** @description 获取文书预览数据 */
  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const template = await findOwnedTemplate(String(req.params.id), req.user.id)
      if (!template) return errorResponse(res, '文书资料不存在', 404)

      const normalizedSubject = (template.subject || '').replace(/\\/g, '/')
      const extension = (template.fileExtension || extname(template.originalFileName || normalizedSubject)).toLowerCase()
      const assetUrl = template.storagePath ? `/api/templates/${template.id}/asset` : null

      if (!template.storagePath) {
        const isLegacyLocalEntry = normalizedSubject.startsWith('本地文件/') || /^[a-z]:\//i.test(normalizedSubject)
        const isMarkdown = template.category === 'ONLINE_DOC' || MARKDOWN_EXTENSIONS.has(extension)
        const payload: TemplatePreviewPayload = {
          mode: isLegacyLocalEntry ? 'missing' : isMarkdown ? 'markdown' : 'text',
          content: template.content || '',
          assetUrl: null,
          notice: isLegacyLocalEntry
            ? '这是旧版仅保存摘要的导入记录，请重新导入原文件后再使用网页预览。'
            : null,
          mimeType: template.mimeType,
          originalFileName: template.originalFileName,
          fileExtension: extension || null,
          sourceType: template.sourceType,
        }
        return successResponse(res, payload)
      }

      try {
        const fileStat = await stat(template.storagePath)
        if (!fileStat.isFile()) {
          throw new Error('invalid file')
        }
      } catch {
        const payload: TemplatePreviewPayload = {
          mode: 'missing',
          content: template.content || '',
          assetUrl: null,
          notice: '原始文件不存在或无法访问，请重新导入。',
          mimeType: template.mimeType,
          originalFileName: template.originalFileName,
          fileExtension: extension || null,
          sourceType: template.sourceType,
        }
        return successResponse(res, payload)
      }

      const previewData = await buildFilePreviewPayload(template.storagePath, extension)
      const payload: TemplatePreviewPayload = {
        mode: previewData.mode,
        content: previewData.content,
        assetUrl,
        notice: previewData.mode === 'download'
          ? '当前格式暂不支持结构化预览，已提供原文件打开入口。'
          : null,
        mimeType: template.mimeType || guessMimeTypeByExtension(extension),
        originalFileName: template.originalFileName,
        fileExtension: extension || null,
        sourceType: template.sourceType,
      }
      return successResponse(res, payload)
    } catch (err) {
      return next(err)
    }
  }

  /** @description 输出原始文书文件 */
  async asset(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const template = await findOwnedTemplate(String(req.params.id), req.user.id)
      if (!template || !template.storagePath) return errorResponse(res, '文书原文件不存在', 404)

      let fileStat: Awaited<ReturnType<typeof stat>>
      try {
        fileStat = await stat(template.storagePath)
      } catch {
        return errorResponse(res, '文书原文件不存在', 404)
      }

      if (!fileStat.isFile()) {
        return errorResponse(res, '文书原文件不存在', 404)
      }

      const extension = (template.fileExtension || extname(template.originalFileName || template.storagePath)).toLowerCase()
      const mimeType = template.mimeType || guessMimeTypeByExtension(extension)
      const fileName = encodeURIComponent(template.originalFileName || basename(template.storagePath))

      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Length', String(fileStat.size))
      res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${fileName}`)
      createReadStream(template.storagePath).pipe(res)
    } catch (err) {
      return next(err)
    }
  }

  /** @description 更新文书资料 */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const userId = req.user.id
      const id = String(req.params.id)
      const exists = await prisma.emailTemplate.findFirst({
        where: { id, userId },
        select: { id: true, subject: true, content: true, storagePath: true },
      })
      if (!exists) return errorResponse(res, '文书资料不存在', 404)

      const body = req.body as TemplateBody
      const data: Record<string, string> = {}
      if (body.name !== undefined) data.name = toTrimmedString(body.name)
      if (body.subject !== undefined) data.subject = toTrimmedString(body.subject)
      if (body.content !== undefined) data.content = toTrimmedString(body.content)
      if (body.category !== undefined) data.category = toTrimmedString(body.category)

      if (Object.keys(data).length === 0) {
        return errorResponse(res, '至少提供一个可更新字段', 400)
      }
      if ('name' in data && !data.name) {
        return errorResponse(res, 'name 不能为空', 400)
      }

      const finalSubject = data.subject !== undefined
        ? data.subject
        : exists.subject || ''
      const finalContent = data.content !== undefined
        ? data.content
        : exists.content || ''

      if (!finalSubject && !finalContent && !exists.storagePath) {
        return errorResponse(res, '文件路径/链接 与 内容摘要不能同时为空', 400)
      }

      const template = await prisma.emailTemplate.update({ where: { id }, data })
      return successResponse(res, template, '更新成功')
    } catch (err) {
      return next(err)
    }
  }

  /** @description 删除文书资料 */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return errorResponse(res, '未登录', 401)
      const id = String(req.params.id)
      const exists = await prisma.emailTemplate.findFirst({
        where: { id, userId: req.user.id },
      })
      if (!exists) return errorResponse(res, '文书资料不存在', 404)

      await prisma.emailTemplate.delete({ where: { id } })
      if (exists.sourceType === 'FILE_UPLOAD' && exists.storagePath && isManagedStoragePath(exists.storagePath)) {
        await rm(exists.storagePath, { force: true })
      }

      return successResponse(res, null, '删除成功')
    } catch (err) {
      return next(err)
    }
  }
}
