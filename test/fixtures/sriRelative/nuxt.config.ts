export default defineNuxtConfig({
  modules: ['../../../src/module'],
  ssr: false,
  security: {
    rateLimiter: false,
    sri: true,
    ssg: { hashStyles: true },
  },
})
