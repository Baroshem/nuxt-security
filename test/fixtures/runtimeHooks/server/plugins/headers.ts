export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('nuxt-security:ready', async() => {

    // CSP will be set to the static values provided here
    nitroApp.hooks.callHook('nuxt-security:headers', {
      route: '/headers-static',
      headers: {
        contentSecurityPolicy: {
          "script-src": ["'self'", "static-value.com"],
        }
      }
    })

    // CSP will be set to the dynamic values fetched from the API
    const { headers } = await $fetch('/api/runtime-headers')
    nitroApp.hooks.callHook('nuxt-security:headers', {
      route: '/headers-dynamic', 
      headers
    })
  })
})