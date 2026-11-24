import { getMethod, defineEventHandler, getRequestHeader, createError, useRuntimeConfig, enforceBodyLimit } from '#nuxt-security/server'
import { defaultSecurityConfig } from '../../../defaultConfig'
import { resolveSecurityRules } from '../../nitro/context'
import type { RequestSizeLimiter } from '../../../types/middlewares'
import defu from 'defu'

export default defineEventHandler(async(event) => {
  const rules = resolveSecurityRules(event)
  if (!rules.enabled || !rules.requestSizeLimiter || ['GET', 'HEAD'].includes(getMethod(event))) return
  const defaults = defaultSecurityConfig('', useRuntimeConfig(event).security?.strict ?? false).requestSizeLimiter as Required<RequestSizeLimiter>
  const options = defu(rules.requestSizeLimiter, defaults)
  const type = getRequestHeader(event, 'content-type') || ''
  const limit = /^multipart\/form-data(?:;|$)/i.test(type) ? options.maxUploadFileRequestInBytes : options.maxRequestSizeInBytes
  const rawLength = getRequestHeader(event, 'content-length')
  // Some internal fetch implementations stringify absent headers. Actual bytes are still checked. / 內部 fetch 可能字串化缺失標頭，仍檢查實際 bytes。
  const length = rawLength === 'undefined' || rawLength === 'null' ? undefined : rawLength
  if (length !== undefined && length !== null && length !== "" && !/^\d+$/.test(length)) throw createError({ statusCode: 400, statusMessage: 'Invalid Content-Length' })
  try {
    if (length !== undefined && Number(length) > limit) throw Object.assign(new Error('Payload Too Large'), { statusCode: 413 })
    await enforceBodyLimit(event, limit)
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode !== 413) throw error
    const result = { statusCode: 413, statusMessage: 'Payload Too Large' }
    if (options.throwError === false) return result
    throw createError(result)
  }
})
