import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  // security: {
  //   rateLimiter: {
  //     value: {
  //       tokensPerInterval: 2,
  //       interval: 'hour',
  //       fireImmediately: true
  //     },
  //     route: '',
  //     throwError: false
  //   }
  // }
  // security: {
  //   basicAuth: {
  //     route: '',
  //     value: {
  //       name: 'test',
  //       pass: 'test',
  //       enabled: true,
  //       message: 'test'
  //     }
  //   }
  // }
  // security: {
  //   headers: {
  //     crossOriginResourcePolicy: {
  //       value: "test",
  //       route: '/**',
  //     },
  //   },
  //   requestSizeLimiter: {
  //     value: {
  //       maxRequestSizeInBytes: 3000000,
  //       maxUploadFileRequestInBytes: 9000000,
  //     },
  //     route: '/upload-file'
  //   }
  // }
})
