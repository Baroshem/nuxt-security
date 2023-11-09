export default defineNuxtConfig({
  extends: ['@nuxt-themes/docus'],
  modules: ['@nuxtjs/plausible', '@nuxtlabs/github-module', '../src/module'],

  security: {
    rateLimiter: false,
    nonce: false,
    ssg: {
      hashScripts: true,
      hashStyles: false,
    },
    headers: {
      contentSecurityPolicy: {
        "script-src": []
      },
    }
  },

  routeRules: {
    '/': {
      prerender: true
    }
  },

  github: {
    owner: 'Baroshem',
    repo: 'nuxt-security',
    branch: 'main'
  }
})