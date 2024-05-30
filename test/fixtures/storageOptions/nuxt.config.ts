export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
    rateLimiter: {
      tokensPerInterval: 3,
      interval: 1000000,
      driver: { 
        name: 'fsLite',
        options: {
          base: './test/fixtures/storageOptions/.nuxt/test/.data/db'
        }
      }
    }
  }
})
