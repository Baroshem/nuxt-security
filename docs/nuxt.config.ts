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
        'img-src': ["'self'", "data:", 'https:'] // Allow https: external images
      },
      crossOriginEmbedderPolicy: 'credentialless' // Allow youtube and stackblitz iframes
    }
  }
})
