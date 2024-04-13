import { defineNitroPlugin, removeResponseHeader } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    const { rules } = event.context.security
    if (rules.hidePoweredBy && !event.node.res.headersSent) {
      removeResponseHeader(event, 'x-powered-by')
    }
  })
})
