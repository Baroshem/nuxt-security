import { defineEventHandler, setResponseHeader, useStorage } from '#nuxt-security/server'
import { resolveSecurityRules } from '../../nitro/context'
import { generateRandomNonce } from '../../../utils/crypto'
import { injectNonceToTags } from '../../../utils/nonce'
import { getNameFromKey, headerStringFromObject } from '../../../utils/headers'
import type { OptionKey } from '../../../types/headers'

export default defineEventHandler(async event => {
  if (import.meta.prerender) return
  const rules = resolveSecurityRules(event)
  if (!rules.enabled || !rules.ssg || !rules.ssg.dynamicNonce || !rules.nonce) return
  const pages = await useStorage('assets:nuxt-security').getItem<Record<string, string>>('dynamic.json') || {}
  const page = pages[event.path.split('?')[0]]
  if (!page) return
  const nonce = generateRandomNonce()
  event.context.security!.nonce = nonce
  if (rules.headers) {
    for (const [key, value] of Object.entries(rules.headers)) {
      if (value === false) continue
      const name = key === 'contentSecurityPolicy' && rules.contentSecurityPolicyReportOnly ? 'Content-Security-Policy-Report-Only' : getNameFromKey(key as OptionKey)
      if (key === 'contentSecurityPolicy' && rules.contentSecurityPolicyReportOnly && rules.headers.contentSecurityPolicyReportOnly) continue
      const header = headerStringFromObject(key as OptionKey, value).replace(/'nonce-\{\{nonce\}\}'/g, `'nonce-${nonce}'`)
      setResponseHeader(event, name, header)
    }
  }
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return injectNonceToTags(page.replace(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, ''), nonce)
})
