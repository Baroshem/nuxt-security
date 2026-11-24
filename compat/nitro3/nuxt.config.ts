export default defineNuxtConfig({
  compatibilityDate: '2026-11-23',
  modules: [process.env.NUXT_SECURITY_DIST ? '../../dist/module.mjs' : '../../src/module'],
  experimental: { nitroAutoImports: false, ssrStreaming: true },
  routeRules: { '/static': { prerender: true }, '/api/echo': { csurf: false } },
  security: { rateLimiter: { tokensPerInterval: 100, interval: 60000 }, csrf: true }
})
