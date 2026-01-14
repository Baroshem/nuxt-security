import { defineNitroPlugin, getRouteRules } from 'nitropack/runtime'
import { setResponseHeader, removeResponseHeader, getResponseHeader } from 'h3'
import { resolveSecurityRules } from '../context'
import { getNameFromKey, headerStringFromObject } from '../../../utils/headers'
import type { OptionKey } from '../../../types/headers'

/**
 * This plugin sets the security headers for the response.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.headers) {
      const headers = rules.headers

      Object.entries(headers).forEach(([header, value]) => {
        const headerName = getNameFromKey(
          header as OptionKey,
          header === 'contentSecurityPolicy' && value && typeof value === 'object'
            ? { reportOnly: (value as Record<string, unknown>)['report-only'] === true }
            : undefined
        )
        if (value === false) {
          const { headers: standardHeaders } = getRouteRules(event)
          const standardHeaderValue = standardHeaders?.[headerName]
          const currentHeaderValue = getResponseHeader(event, headerName)
          if (standardHeaderValue === currentHeaderValue) {
            removeResponseHeader(event, headerName)
          }
        } else {
          const headerValue = headerStringFromObject(header as OptionKey, value)
          setResponseHeader(event, headerName, headerValue)
        }
      })
    }
  })
})
