export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
    basicAuth: {
      name: 'test',
      pass: 'test',
      enabled: true,
      message: 'test'
      // exclude/include not set
    }
  }
})
