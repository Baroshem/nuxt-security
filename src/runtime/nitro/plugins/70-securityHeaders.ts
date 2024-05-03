import { defineNitroPlugin, setResponseHeader, removeResponseHeader, getRouteRules, getResponseHeader } from '#imports'
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
        const headerName = getNameFromKey(header as OptionKey)
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
