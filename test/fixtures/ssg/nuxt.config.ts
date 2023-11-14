import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({

  modules: ['../../../src/module'],

  // Per route configuration
  routeRules: {
    '/': {
      prerender: true
    },
    '/inline-script': {
      prerender: true,
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
    }
  },

  // Global configuration
  security: {
    rateLimiter: false,
    sri: true,
    ssg: {
      hashScripts: true,
      hashStyles: true
    }
  },

})
