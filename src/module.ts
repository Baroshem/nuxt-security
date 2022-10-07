import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addServerHandler } from '@nuxt/kit'
import defu from 'defu'
import { ModuleOptions } from './types'

// TODO: add route to each middleware attached so that it can be added on certain routes and globally.

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-security',
    configKey: 'security'
  },
  defaults: {
    headers: {
      crossOriginResourcePolicy: "same-origin",
      crossOriginOpenerPolicy: "same-origin",
      crossOriginEmbedderPolicy: "require-corp",
      contentSecurityPolicy: "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
      originAgentCluster: '?1',
      referrerPolicy: 'no-referrer',
      strictTransportSecurity: 'max-age=15552000; includeSubDomains',
      xContentTypeOptions: 'nosniff',
      xDNSPrefetchControl: 'off',
      xDownloadOptions: 'noopen',
      xFrameOptions: 'SAMEORIGIN',
      xPermittedCrossDomainPolicies: 'none',
      xXSSProtection: 0,
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 2000000,
      maxUploadFileRequestInBytes: 8000000
    },
    rateLimiter: {
      // Twitter search rate limiting
      tokensPerInterval: 150,
      interval: "hour"
    }
  },
  setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.runtimeConfig.security = defu(nuxt.options.runtimeConfig.security, {
      ...options
    })

    // Register enabled middlewares to automatically set default values for security response headers.
    for (const header in nuxt.options.runtimeConfig.security.headers) {
      if (nuxt.options.runtimeConfig.security.headers[header]) {
        addServerHandler({ route: '', handler: resolve(runtimeDir, `server/middleware/headers/${header}`) })
      }
    }

    // Register requestSizeLimiter middleware with default values that will throw an error when the payload will be too big for methods like POST/PUT/DELETE.
    if(nuxt.options.runtimeConfig.security.requestSizeLimiter) {
      addServerHandler({ route: '', handler: resolve(runtimeDir, 'server/middleware/requestSizeLimiter') })
    }

    // Register rateLimiter middleware with default values that will throw an error when there will be too many requests from the same IP during certain interval.
    // Based on 'limiter' package and stored in 'memory-cache'
    if (nuxt.options.runtimeConfig.security.rateLimiter) {
      addServerHandler({ route: '', handler: resolve(runtimeDir, 'server/middleware/rateLimiter') })
    }
  }
})
