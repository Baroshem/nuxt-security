import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
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
