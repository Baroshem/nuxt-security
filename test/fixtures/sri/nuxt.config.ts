export default defineNuxtConfig({

  modules: ['../../../src/module'],
  experimental: {
    inlineSSRStyles: false, // disable inlining css to test asset import
    entryImportMap: true
  },
  vite: {
    build: {
      target: 'esnext', // ensure the entry import map is used by this fixture
      rollupOptions: {
        output: { entryFileNames: '_nuxt/nested/[name].[hash].js' }
      }
    }
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
