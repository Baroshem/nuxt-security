import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  security: {
    rateLimiter: {
      tokensPerInterval: 2,
      interval: 'hour',
      fireImmediately: true
    }
  }
})
