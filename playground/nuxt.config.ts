import { defineNuxtConfig } from 'nuxt/config'
import NuxtSecurity from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtSecurity],

  // Per route configuration
  routeRules: {
    secret: {
      security: {
        rateLimiter: false
      },
      headers: {
        'X-XSS-Protection': '1'
      }
    }
  },

  // Global configuration
  security: {
    headers: {
      xXSSProtection: '0',
      contentSecurityPolicy: {
        'style-src': ["'self'", "'nonce-{{nonce}}'"],
        'script-src': [
          "'self'", // backwards compatibility for older browsers that don't support strict-dynamic
          "'nonce-{{nonce}}'",
          "'strict-dynamic'"
        ],
        'script-src-attr': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"]
      }
    },
    rateLimiter: {
      tokensPerInterval: 10
    },
    nonce: true
  }
})
