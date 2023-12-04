export default defineNuxtConfig({

  modules: ['../../../src/module'],

  // Per route configuration
  routeRules: {
    '/public': {
      prerender: true,
    }
  },

  // Global configuration
  security: {
    rateLimiter: false,
    sri: true
  },

})
