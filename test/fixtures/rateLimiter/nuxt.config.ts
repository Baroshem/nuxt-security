import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  security: {
    rateLimiter: {
      tokensPerInterval: 3,
      interval: 'day',
    }
  },
  routeRules: {
    'test': {
      security: {
        rateLimiter: {
          tokensPerInterval: 10,
          interval: 'hour',
        }
      }
    }
  }
})
