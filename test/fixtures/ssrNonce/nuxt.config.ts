export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],

  routeRules: {
    '/renew': {
      security: {
        //@ts-expect-error Purposedly deprecated configuration
        nonce: { mode: 'check' }
      }
    },
    '/disabled': {
      security: {
        nonce: false
      }
    },
    '/prerendered': {
      prerender: true
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
        ]
      }
    }
  }
})
