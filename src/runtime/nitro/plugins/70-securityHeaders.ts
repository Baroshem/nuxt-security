import { defineNitroPlugin, getRouteRulesHeaders, onPageResponse } from '#nuxt-security/server'
import { resolveSecurityRules } from '../context'
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
})
