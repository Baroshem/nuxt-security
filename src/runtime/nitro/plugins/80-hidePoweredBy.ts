import { defineNitroPlugin } from 'nitropack/runtime'
import { removeResponseHeader } from 'h3'
import { resolveSecurityRules } from '../context'

/**
 * This plugin hides the X-Powered-By header from the response.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.hidePoweredBy && !event.node.res.headersSent) {
      removeResponseHeader(event, 'x-powered-by')
    }
  })
})
