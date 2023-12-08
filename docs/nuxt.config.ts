export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  modules: ['@nuxtjs/plausible', '@nuxtlabs/github-module'],

  github: {
    owner: 'Baroshem',
    repo: 'nuxt-security',
    branch: 'main',
  }
})
