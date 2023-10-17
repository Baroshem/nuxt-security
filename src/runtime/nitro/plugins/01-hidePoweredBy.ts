import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response) => {
    if (response?.headers?.['x-powered-by']) {
      delete response.headers['x-powered-by']
    }
  })
})
