import { defineNitroPlugin, removeResponseHeader } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (!event.node.res.headersSent) {
      removeResponseHeader(event, 'x-powered-by')
    }
  })
})
