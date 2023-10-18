import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
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
