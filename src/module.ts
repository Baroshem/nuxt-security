import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addServerHandler } from '@nuxt/kit'
import defu from 'defu'
import { MiddlewareConfiguration, ModuleOptions, RateLimiter, RequestSizeLimiter, SecurityHeaders, XssValidator } from './types'
import { defaultSecurityConfig } from './defaultConfig'
import { SECURITY_HEADER_NAMES } from './headers'
import { Nuxt, NuxtOptions, RuntimeConfig } from '@nuxt/schema'
import { CorsOptions } from '@nozomuikuta/h3-cors'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-security',
    configKey: 'security'
  },
  defaults: defaultSecurityConfig,
  setup (options, nuxt: Nuxt & { options: NuxtOptions & { security: ModuleOptions } }) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.security = defu(nuxt.options.security, {
      ...options
    })

    if (nuxt.options.security.hidePoweredBy) {
      nuxt.hook('nitro:config', (config) => {
        config.plugins = config.plugins || []
        config.plugins.push(fileURLToPath(new URL('./runtime/nitro', import.meta.url)))
      })
    }

    nuxt.options.runtimeConfig.security = defu(nuxt.options.runtimeConfig.security, {
      ...nuxt.options.security as RuntimeConfig['security']
    })

    // Register enabled middlewares to automatically set default values for security response headers.
    if (nuxt.options.security.headers) {
      for (const header in nuxt.options.security.headers as SecurityHeaders) {
        if (nuxt.options.security.headers[header]) {
          // Have to create this manually, otherwise the build will fail. Also, have to create empty object first or use the previous headers if they are for the same route
          nuxt.options.nitro.routeRules[nuxt.options.security.headers[header].route] = { headers: nuxt.options.nitro.routeRules[nuxt.options.security.headers[header].route] ? { ...nuxt.options.nitro.routeRules[nuxt.options.security.headers[header].route].headers } : {} }

          nuxt.options.nitro.routeRules[nuxt.options.security.headers[header].route].headers[SECURITY_HEADER_NAMES[header]] = nuxt.options.security.headers[header].value
        }
      }
    }

    // Register requestSizeLimiter middleware with default values that will throw an error when the payload will be too big for methods like POST/PUT/DELETE.
    // TODO: fix the conditions here. What if user passes '{}'? It will result true here and later will break
    const requestSizeLimiterConfig = nuxt.options.security.requestSizeLimiter
    if(requestSizeLimiterConfig) {
      addServerHandler({ route: (requestSizeLimiterConfig as MiddlewareConfiguration<RequestSizeLimiter>).route, handler: resolve(runtimeDir, 'server/middleware/requestSizeLimiter') })
    }

    // Register rateLimiter middleware with default values that will throw an error when there will be too many requests from the same IP during certain interval.
    // Based on 'limiter' package and stored in 'unstorage' for each ip address.
    const rateLimiterConfig = nuxt.options.security.rateLimiter
    if (rateLimiterConfig) {
      addServerHandler({ route: (rateLimiterConfig as MiddlewareConfiguration<RateLimiter>).route, handler: resolve(runtimeDir, 'server/middleware/rateLimiter') })
    }

    // Register xssValidator middleware with default config that will return 400 Bad Request when either query or body will include unwanted characteds like <script>
    // Based on 'xss' package and works for both GET and POST requests
    const xssValidatorConfig = nuxt.options.security.xssValidator
    if (xssValidatorConfig) {
      addServerHandler({ route: (xssValidatorConfig as MiddlewareConfiguration<XssValidator>).route, handler: resolve(runtimeDir, 'server/middleware/xssValidator') })
    }

    // Register corsHandler middleware with default config that will add CORS setup
    // Based on '@nozomuikuta/h3-cors' package
    const corsHandlerConfig = nuxt.options.security.corsHandler
    if (corsHandlerConfig) {
      addServerHandler({ route: (corsHandlerConfig as MiddlewareConfiguration<CorsOptions>).route, handler: resolve(runtimeDir, 'server/middleware/corsHandler') })
    }
  }
})
