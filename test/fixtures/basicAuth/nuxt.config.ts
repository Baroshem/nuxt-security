import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  security: {
    basicAuth: {
      exclude: ['/api'],
      name: 'test',
      pass: 'test',
      enabled: true,
      message: 'test'
    }
  }
})
