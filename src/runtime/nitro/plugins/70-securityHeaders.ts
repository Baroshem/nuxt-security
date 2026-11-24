import { defineNitroPlugin, getRouteRulesHeaders, onPageResponse, onResponse } from '#nuxt-security/server'
import { extensionHeaders } from '../../../utils/extensions'
import { getAppSecurityOptions, resolveSecurityRules } from '../context'
import { getNameFromKey, headerStringFromObject } from '../../../utils/headers'
import type { HeaderName, OptionKey } from '../../../types/headers'

/**
 * This plugin sets the security headers for the response.
 */
export default defineNitroPlugin((nitroApp) => {
  onPageResponse(nitroApp, (event, responseHeaders) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.headers) {
      const headers = rules.headers

      Object.entries(headers).forEach(([header, value]) => {
        if (header === 'contentSecurityPolicy' && rules.contentSecurityPolicyReportOnly && headers.contentSecurityPolicyReportOnly) return
        const headerName: HeaderName = header === 'contentSecurityPolicy' && rules.contentSecurityPolicyReportOnly
          ? 'Content-Security-Policy-Report-Only'
          : getNameFromKey(header as OptionKey)

        if (value === false) {
          const standardHeaders = getRouteRulesHeaders(event)
          const standardHeaderValue = standardHeaders?.[headerName]
          const currentHeaderValue = responseHeaders.get(headerName)
          if (standardHeaderValue === currentHeaderValue) {
            responseHeaders.delete(headerName)
          }
        } else {
          const headerValue = headerStringFromObject(header as OptionKey, value)
          responseHeaders.set(headerName, headerValue)
        }
      })
    }
  })
  onResponse(nitroApp, (event, responseHeaders) => {
    const extension = extensionHeaders(event.path, getAppSecurityOptions()['/**']?.byFileExtension)
    const rules = resolveSecurityRules(event)
    if (!extension || !rules.enabled || !rules.headers) return
    for (const name of Object.keys(extension)) {
      const key = name as OptionKey
      const value = rules.headers[key]
      if (value === false) responseHeaders.delete(getNameFromKey(key))
      else if (value !== undefined) responseHeaders.set(getNameFromKey(key), headerStringFromObject(key, value))
    }
  })

})
