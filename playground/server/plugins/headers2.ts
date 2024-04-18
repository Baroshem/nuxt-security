export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('nuxt-security:routeRules', async routeRules => {
    const options = await $fetch('/api/runtime-headers')
    routeRules['/runtime2'] = options
    // The server name will be apparent
  })
})