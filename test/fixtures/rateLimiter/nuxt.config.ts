import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  security: {
    rateLimiter: {
      tokensPerInterval: 3,
      interval: 300000
    }
  },
  routeRules: {
    test: {
      security: {
        rateLimiter: {
          tokensPerInterval: 10,
          interval: 'hour'
        }
      }
    }
  }
})
