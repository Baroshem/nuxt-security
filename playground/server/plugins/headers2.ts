export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('nuxt-security:routeRules', async routeRules => {
    const options = await $fetch('/api/runtime-headers')
    // We use the auto-imported defuReplaceArray merging function
    routeRules['/runtime2'] = defuReplaceArray(
      options,
      routeRules['/runtime2']
    )
    // The server name will be apparent
  })
})