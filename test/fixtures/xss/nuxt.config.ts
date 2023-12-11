export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  routeRules: {
    'test': {
      security: {
        xssValidator: false
      }
    }
  }
})
