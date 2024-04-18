import defu from "defu"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('nuxt-security:routeRules', async routeRules => {
    const { headers } = await $fetch('/api/runtime-headers')
    routeRules['/'] = { headers, nonce: false }
  })
})