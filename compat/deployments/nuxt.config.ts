export default defineNuxtConfig({
  modules: [process.env.NUXT_SECURITY_DIST ? '../../dist/module.mjs' : '../../src/module'],
  compatibilityDate: '2026-11-23',
  nitro: { output: process.env.NUXT_SECURITY_OUTPUT ? { dir: process.env.NUXT_SECURITY_OUTPUT } : undefined },
  routeRules: { '/': { prerender: true }, '/isr': { isr: 60 } },
  security: { rateLimiter: false, byFileExtension: { '.svg': { headers: { contentSecurityPolicy: { 'default-src': ["'none'"] }, xContentTypeOptions: 'nosniff' } } } }
})
