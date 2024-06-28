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
    strict: true,
    headers: {
      contentSecurityPolicy: {
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", "data:", 'https:'], // Allow https: external images
        'connect-src': process.env.NODE_ENV === 'development' ? ["'self'", 'https:', 'ws:'] : ["'self'", 'https:'], // Allow websocket in dev mode
        'frame-src': ['https://www.youtube-nocookie.com', 'https://stackblitz.com'], // Allow youtube and stackblitz iframes
      },
      permissionsPolicy: {
        "picture-in-picture": ['self', '"https://www.youtube-nocookie.com"'], // Allow picture-in-picture for youtube
        "fullscreen": ['self', '"https://www.youtube-nocookie.com"'], // Allow fullscreen for youtube
      },
      crossOriginEmbedderPolicy: 'unsafe-none', // Allow youtube and stackblitz iframes
    },
    ssg: {
      hashStyles: false
    }
  }
})
