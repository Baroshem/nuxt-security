import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module'],

  // Per route configuration
  routeRules: {
    '/secret': {
      security: {
        rateLimiter: false,
        headers: {
          strictTransportSecurity: {
            preload: true
          }
        }
      },
      headers: {
        'X-XSS-Protection': '1',
        'Foo': 'Bar'
      }
    },
    '/about': {
      prerender: true
    },
    '/swr': {
      swr: 60
    },
    '/preserve': {
      security: {
        headers: {
          contentSecurityPolicy: false,
          referrerPolicy: false
        }
      }
    }
  },

  // Global configuration
  security: {
    headers: {
      xXSSProtection: '0'
    },
    rateLimiter: {
      tokensPerInterval: 1000,
      interval: 10000
    },
    removeLoggers: false
  }
})
