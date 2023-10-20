import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],

  routeRules: {
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
