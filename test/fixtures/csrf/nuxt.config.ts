export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
    csrf: true
  },
  routeRules: {
    '/api/test-no-csrf': {
      csurf: false
    }
  }
})
