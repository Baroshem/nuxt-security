export default defineNuxtConfig({
  modules: ['../../../src/module'],

  // Per route configuration
  routeRules: {
    '/': {
      prerender: true
    },
    '/inline-script': {
      prerender: true
    },
    '/inline-style': {
      prerender: true
    },
    '/external-script': {
      prerender: true
    },
    '/external-style': {
      prerender: true
    },
    '/external-link': {
      prerender: true
    },
    '/not-ssg': {
      prerender: false
    },
    '/no-meta-tag': {
      prerender: true,
      security: {
        ssg: {
          meta: false
        }
      }
    }
  },

  // Global configuration
  security: {
    rateLimiter: false,
    sri: true,
    ssg: {
      meta: true,
      hashScripts: true,
      hashStyles: true
    }
  }
})
