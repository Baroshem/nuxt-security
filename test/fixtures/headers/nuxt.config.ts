export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  routeRules: {
    '/test': {
      headers: {
        'x-xss-protection': '1',
      }
    }
  }
})
