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
      xXSSProtection: '0'
    },
    rateLimiter: {
      tokensPerInterval: 10,
      interval: 10000
    }
  }
})
