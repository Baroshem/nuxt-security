import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: ['./node_modules/@docus/docs-theme'],

  modules: ['@docus/github'],

  github: {
    owner: 'Baroshem',
    repo: 'nuxt-security',
    branch: 'main'
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: '#00dc82',
              50: '#ffffff',
              100: '#e6fcf3',
              200: '#ccf8e6',
              300: '#b3f5da',
              400: '#99f1cd',
              500: '#00dc82',
              600: '#33e39b',
              700: '#006e41',
              800: '#004227',
              900: '#00160d'
            }
          }
        }
      }
    }
  }
})
