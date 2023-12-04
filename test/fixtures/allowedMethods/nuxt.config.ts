export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
    allowedMethodsRestricter: {
      methods: ['POST']
    }
  },
  routeRules: {
    '/test': {
      security: {
        allowedMethodsRestricter: {
          methods: ['GET']
        }
      }
    }
  }
})
