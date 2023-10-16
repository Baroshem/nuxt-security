import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '../../../src/module.ts'
  ],
  routeRules: {
    '/test': {
      headers: {
        'x-xss-protection': '1',
      }
    }
  }
})
