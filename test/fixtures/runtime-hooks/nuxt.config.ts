import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  routeRules:{
    '/test': {
      headers: {
        'x-xss-protection': '1',
      }
    }
  },
  security: {
    nonce: false,
    runtimeHooks: true,
    headers: {
      crossOriginResourcePolicy: 'cross-origin',
      contentSecurityPolicy: {
        'frame-ancestors': ['*','weird-value.com'],
        'script-src': ["'unsafe-inline'", '*'],
      },
    },
  }
})
