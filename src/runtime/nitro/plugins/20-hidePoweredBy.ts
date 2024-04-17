import { defineNitroPlugin, removeResponseHeader } from '#imports'
import { resolveSecurityRules } from '../utils/context'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', async(event) => {
    const rules = await resolveSecurityRules(event)
    if (rules.hidePoweredBy && !event.node.res.headersSent) {
      removeResponseHeader(event, 'x-powered-by')
    }
  })
})
