import MyModule from '../../../src/module'

export default defineNuxtConfig({
  app: {
    head: {
      script: [{ src: '/loader.js' }, { src: '/api/generated-script' }]
    }
  },

  modules: [
    MyModule
  ],

  routeRules: {
    '/api/generated-script': {
      security: {
        nonce: { mode: 'check' }
      }
    },
    '/api/nonce-exempt': {
      security: {
        nonce: false
      }
    }
  },
  security: {
    nonce: true,
    headers: {
      contentSecurityPolicy: {
        'script-src': [
          "'self'", // backwards compatibility for older browsers that don't support strict-dynamic
          "'nonce-{{nonce}}'",
          "'strict-dynamic'"
        ],
        'script-src-attr': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"]
      }
    }
  }
})
