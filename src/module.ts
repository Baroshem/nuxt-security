import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addServerHandler } from '@nuxt/kit'
import defu from 'defu'
import { ModuleOptions } from './types'
import { defaultSecurityConfig } from './defaultConfig'
import { RuntimeConfig } from '@nuxt/schema'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-security',
    configKey: 'security'
  },
  defaults: defaultSecurityConfig,
  setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.runtimeConfig.security = defu(nuxt.options.runtimeConfig.security, {
      ...options as RuntimeConfig["security"]
    })

    // Register enabled middlewares to automatically set default values for security response headers.
    if (nuxt.options.runtimeConfig.security.headers) {
      for (const header in nuxt.options.runtimeConfig.security.headers) {
        if (nuxt.options.runtimeConfig.security.headers[header]) {
          addServerHandler({ route: nuxt.options.runtimeConfig.security.headers[header].route, handler: resolve(runtimeDir, `server/middleware/headers/${header}`) })
        }
      }
    }

    // Register requestSizeLimiter middleware with default values that will throw an error when the payload will be too big for methods like POST/PUT/DELETE.
    // TODO: fix the conditions here. What if user passes '{}'? It will result true here and later will break
    const requestSizeLimiterConfig = nuxt.options.runtimeConfig.security.requestSizeLimiter
    if(requestSizeLimiterConfig) {
      addServerHandler({ route: requestSizeLimiterConfig.route, handler: resolve(runtimeDir, 'server/middleware/requestSizeLimiter') })
    }

    // Register rateLimiter middleware with default values that will throw an error when there will be too many requests from the same IP during certain interval.
    // Based on 'limiter' package and stored in 'memory-cache' for each ip address.
    const rateLimiterConfig = nuxt.options.runtimeConfig.security.rateLimiter
    if (rateLimiterConfig) {
      addServerHandler({ route: rateLimiterConfig.route, handler: resolve(runtimeDir, 'server/middleware/rateLimiter') })
    }

    // Register xssValidator middleware with default config that will return 400 Bad Request when either query or body will include unwanted characteds like <script>
    // Based on 'xss' package and works for both GET and POST requests
    const xssValidatorConfig = nuxt.options.runtimeConfig.security.xssValidator
    if (xssValidatorConfig) {
      addServerHandler({ route: xssValidatorConfig.route, handler: resolve(runtimeDir, 'server/middleware/xssValidator') })
    }

    // Register corsHandler middleware with default config that will add CORS setup
    // Based on '@nozomuikuta/h3-cors' package
    const corsHandlerConfig = nuxt.options.runtimeConfig.security.corsHandler
    if (corsHandlerConfig) {
      addServerHandler({ route: corsHandlerConfig.route, handler: resolve(runtimeDir, 'server/middleware/corsHandler') })
    }
  }
})
