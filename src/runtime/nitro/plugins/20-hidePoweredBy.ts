import { defineNitroPlugin, removeResponseHeader } from '#imports'
import { resolveSecurityRules } from '../utils'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.hidePoweredBy && !event.node.res.headersSent) {
      removeResponseHeader(event, 'x-powered-by')
    }
  })
})
