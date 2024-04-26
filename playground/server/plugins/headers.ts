export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('nuxt-security:ready', async() => {
    const { headers } = await $fetch('/api/runtime-headers')
    nitroApp.hooks.callHook('nuxt-security:headers',
      {
        route: '/runtime',
        headers
      })
  })
})