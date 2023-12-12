export default defineNuxtConfig({

  modules: ['../../../src/module'],
  experimental: {
    inlineSSRStyles: false // disable inlining css to test asset import
  },

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
