import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },

  // Per route configuration
  routeRules: {
    '/secret': {
      security: {
        rateLimiter: {
          tokensPerInterval:1000,
          interval: 1000,
        },
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
    '/api/**': {
      security: {
        rateLimiter: false
      }
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
      crossOriginEmbedderPolicy: false,
      xXSSProtection: '0'
    },
    rateLimiter: {
      tokensPerInterval: 3,
      interval: 30000,
      headers: true
    },
    removeLoggers: false
  }
})
