export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
    basicAuth: {
      exclude: ['/api', '/content'],
      include: ['/api/hello/world', '/admin'],
      name: 'test',
      pass: 'test',
      enabled: true,
      message: 'test'
    }
  }
})
