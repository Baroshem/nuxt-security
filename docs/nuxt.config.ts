export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  modules: ['@nuxtjs/plausible', '@nuxtlabs/github-module', 'nuxt-security'],
  experimental: {
    // Need this otherwise vue-server-renderer not found
    externalVue: false
  },

  github: {
    owner: 'Baroshem',
    repo: 'nuxt-security',
    branch: 'main'
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", "data:", 'https:'], // Allow https: external images
        'connect-src': process.env.NODE_ENV === 'development' ? ["'self'", 'https:', 'ws:'] : ["'self'", 'https:'], // Allow self and image api
        'frame-src': ['https://www.youtube-nocookie.com', 'https://stackblitz.com'], // Allow self and youtube and stackblitz iframes
      },
      crossOriginEmbedderPolicy: 'unsafe-none', // Allow youtube and stackblitz iframes
    }
  }
})
