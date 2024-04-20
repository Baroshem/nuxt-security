export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
    rateLimiter: {
      tokensPerInterval: 3,
      interval: 300000
    }
  },
  routeRules: {
    '/test': {
      security: {
        rateLimiter: {
          tokensPerInterval: 10,
        }
      }
    }
  }
})
