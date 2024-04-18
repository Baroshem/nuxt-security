export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('nuxt-security:routeRules', async(routeRules) => {

    // CSP will be set to the static values provided here
    routeRules['/rules-static'] = {
      hidePoweredBy: false,
      headers: {
        contentSecurityPolicy: {
          "script-src": ["'self'", "static-value.com"],
        }
      }
    }

    // CSP will be set to the dynamic values fetched from the API
    const options = await $fetch('/api/runtime-headers')
    routeRules['/rules-dynamic'] = options
  })
})