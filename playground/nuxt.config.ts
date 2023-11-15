import { defineNuxtConfig } from 'nuxt/config'
import NuxtSecurity from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtSecurity],

  // Per route configuration
  routeRules: {
    '/**': { 
      headers: {
        'X-Toto': 'xxx',
        'Y-Toto': 'yyy'
      }
    },
    secret: {
      security: {
        rateLimiter: false,
        nonce: true,
        headers: {
          contentSecurityPolicy: {
            "manifest-src": ["'self'", 'https:']
          }
        }
      },
      headers: {
        'X-XSS-Protection': '1',
        'X-Toto': '',
        'Z-Toto': 'zzzzzz'
      },
    },
    '/about': {
      headers: {
        'Content-Security-Policy': "script-src 'self'"
      }
    },
  },

  // Global configuration
  security: {
    headers: {
      xXSSProtection: '0',
    },
    rateLimiter: {
      tokensPerInterval: 10,
      interval: 10000
    }
  }
})
