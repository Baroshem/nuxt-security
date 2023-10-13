import { defineNuxtConfig } from 'nuxt/config'
import NuxtSecurity from '../src/module'

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {rel:'icon', href:'/some.png'},
        {rel:'stylesheet', href:'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', integrity: 'sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN', crossorigin: true }
    ],
      style: [],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js', integrity:'sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL', crossorigin: true}
      ]
    }
  },
  ssr: true,
  css: ['~/assets/toto.css'],
  experimental: {
    payloadExtraction: false
  },
  

  modules: [NuxtSecurity],

  // Per route configuration
  routeRules: {
    'secret': {
      security: {
        rateLimiter: false
      },
      headers: {
        'X-XSS-Protection': '1'
      },
    },
    '/tests/2': { prerender: true }
  },

  // Global configuration
  security: {
    headers: {
      xXSSProtection: '0',
      contentSecurityPolicy: {
        'script-src': ["'strict-dynamic'", "'nonce-{{nonce}}'"]
      }
    },
    rateLimiter: {
      tokensPerInterval: 1000,
      interval: 'second'
    },
    sri: true
  },

})
