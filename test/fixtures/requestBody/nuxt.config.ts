export default defineNuxtConfig({
  modules: ['../../../src/module'],
  security: { rateLimiter: false, xssValidator: false, requestSizeLimiter: { maxRequestSizeInBytes: 32, maxUploadFileRequestInBytes: 64 } }
})
