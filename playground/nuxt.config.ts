import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module'],

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
      xXSSProtection: '0'
    },
    rateLimiter: {
      tokensPerInterval: 10,
      interval: 10000
    },
    runtimeHooks: true
  }
})
