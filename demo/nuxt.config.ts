export default defineNuxtConfig({
  extends: ['nuxt-security-docs'],
  modules: ['nuxt-security'],
  experimental: {
    // Need this otherwise vue-server-renderer not found
    externalVue: false
  },
  content: {
    sources: {
      // overwrite default source AKA `content` directory
      content: {
        driver: 'fs',
        // prefix: '/docs', // All contents inside this source will be prefixed with `/docs`
        base: '../docs/content'
      }
    }
  },
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https://i3.ytimg.com/vi/8RDPrptc9uU/hqdefault.jpg'],
        'script-src': ["'self'", "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'"]
      },
    },
    nonce: true,
    rateLimiter: {
      tokensPerInterval: 1500,
      interval: 1000
    },
    ssg: {
      hashScripts: true
    }
  },
  routeRules: {
    '/playground': {
      headers: {
        'Cross-Origin-Embedder-Policy': 'unsafe-none'
      }
    }
  }
})