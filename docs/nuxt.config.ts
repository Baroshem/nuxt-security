export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  modules: ['@nuxtjs/plausible', '@nuxtlabs/github-module'],
  experimental: {
    // Need this otherwise vue-server-renderer not found
    externalVue: false
  },

  github: {
    owner: 'Baroshem',
    repo: 'nuxt-security',
    branch: 'main'
  }
})
