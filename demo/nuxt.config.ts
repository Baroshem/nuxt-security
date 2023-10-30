export default defineNuxtConfig({
  extends: ['nuxt-security-docs'],
  modules: ['nuxt-security'],
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
        'script-src': ["'self'", "'unsafe-inline'"]
      },
    },
    nonce: true
  },
  routeRules: {
    '/playground': {
      headers: {
        'Cross-Origin-Embedder-Policy': 'unsafe-none'
      }
    }
  }
})