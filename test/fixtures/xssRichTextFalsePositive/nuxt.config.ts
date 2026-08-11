export default defineNuxtConfig({
  modules: ['../../../src/module'],
  security: {
    xssValidator: {
      methods: ['POST'],
    },
  },
})
