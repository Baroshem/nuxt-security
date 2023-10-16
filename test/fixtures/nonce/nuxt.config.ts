export default defineNuxtConfig({
  modules: [
    '../../../src/module.ts'
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
    nonce: {
      enabled: true
    },
    headers: {
      contentSecurityPolicy: {
        'style-src': ["'self'", "'nonce-{{nonce}}'"],
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
