import { defineNitroPlugin, onResponse } from '#nuxt-security/server'
import { resolveSecurityRules } from '../context'

/**
 * This plugin hides the X-Powered-By header from the response.
 */
export default defineNitroPlugin((nitroApp) => {
  onResponse(nitroApp, (event, headers) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.hidePoweredBy) {
      headers.delete('x-powered-by')
    }
  })
})
