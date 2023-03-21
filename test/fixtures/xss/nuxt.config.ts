import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  routeRules: {
    'test': {
      security: {
        xssValidator: false
      }
    }
  }
})
