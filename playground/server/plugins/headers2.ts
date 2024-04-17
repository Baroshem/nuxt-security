import defu from "defu"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('nuxt-security:rules', rules => {
    rules.headers = defu(
      { contentSecurityPolicy: { 'upgrade-insecure-requests': false } },
      rules.headers
    )
  })
})