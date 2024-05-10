export default defineNuxtConfig({
  modules: [
    '../../../src/module'
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
    headers: {
      crossOriginResourcePolicy: 'cross-origin',
      contentSecurityPolicy: {
        'frame-ancestors': ['*','weird-value.com'],
        'script-src': ["'unsafe-inline'", '*', "'nonce-{{nonce}}'"],
      },
    },
  }
})
