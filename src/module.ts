import { fileURLToPath } from 'node:url'
import { resolve, normalize } from 'pathe'
import { defineNuxtModule, addServerHandler, installModule } from '@nuxt/kit'
import defu, { createDefu } from 'defu'
import { RuntimeConfig } from '@nuxt/schema'
import { H3CorsOptions } from 'h3'
import {
  AllowedHTTPMethods,
  BasicAuth,
  MiddlewareConfiguration,
  ModuleOptions,
  RateLimiter,
  RequestSizeLimiter,
  SecurityHeaders,
  XssValidator
} from './types'
import { defaultSecurityConfig } from './defaultConfig'
import { SECURITY_HEADER_NAMES, getHeaderValueFromOptions } from './headers'

declare module '@nuxt/schema' {
  interface NuxtOptions {
    security: ModuleOptions;
  }
}

const defuReplaceArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-security',
    configKey: 'security'
  },
  async setup (options, nuxt) {
    // TODO: Migrate to createResolver (from @nuxt/kit)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.security = defuReplaceArray({ ...options, ...nuxt.options.security }, {
      ...defaultSecurityConfig(nuxt.options.devServer.url)
    })
    const securityOptions = nuxt.options.security
    // Disabled module when `enabled` is set to `false`
    if (!securityOptions.enabled) return

    nuxt.hook('nitro:config', (config) => {
      config.plugins = config.plugins || []

      // Register nitro plugin to replace default 'X-Powered-By' header with custom one that does not indicate what is the framework underneath the app.
      if (securityOptions.hidePoweredBy) {
        config.externals = config.externals || {}
        config.externals.inline = config.externals.inline || []
        config.externals.inline.push(normalize(fileURLToPath(new URL('./runtime', import.meta.url))))
        config.plugins.push(
          normalize(fileURLToPath(new URL('./runtime/nitro/plugins/hidePoweredBy', import.meta.url)))
        )
      }

      // Register nitro plugin to enable CSP for SSG
      if (typeof securityOptions.headers === 'object' && securityOptions.headers.contentSecurityPolicy) {
        config.plugins.push(
          normalize(fileURLToPath(new URL('./runtime/nitro/plugins/cspSsg', import.meta.url)))
        )
      }
    })

    nuxt.options.runtimeConfig.security = defu(nuxt.options.runtimeConfig.security, {
      ...securityOptions as RuntimeConfig['security']
    })

    // Register enabled middlewares to automatically set default values for security response headers.
    if (securityOptions.headers) {
      for (const header in securityOptions.headers as SecurityHeaders) {
        if (securityOptions.headers[header as keyof typeof securityOptions.headers]) {
          const nitroRouteRules = nuxt.options.nitro.routeRules
          const headerOptions = securityOptions.headers[header as keyof typeof securityOptions.headers]
          nitroRouteRules!![(headerOptions as any).route] = {
            ...nitroRouteRules!![(headerOptions as any).route],
            headers: {
              ...nitroRouteRules!![(headerOptions as any).route]?.headers,
              [SECURITY_HEADER_NAMES[header]]: getHeaderValueFromOptions(header as keyof SecurityHeaders, headerOptions as any)
            }
          }
        }
      }
    }

    // Register requestSizeLimiter middleware with default values that will throw an error when the payload will be too big for methods like POST/PUT/DELETE.
    const requestSizeLimiterConfig = nuxt.options.security.requestSizeLimiter
    if (requestSizeLimiterConfig) {
      addServerHandler({
        route: (
          requestSizeLimiterConfig as MiddlewareConfiguration<RequestSizeLimiter>
        ).route,
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/requestSizeLimiter')
        )
      })
    }

    // Register rateLimiter middleware with default values that will throw an error when there will be too many requests from the same IP during certain interval.
    // Based on 'limiter' package and stored in 'unstorage' for each ip address.
    const rateLimiterConfig = securityOptions.rateLimiter
    if (rateLimiterConfig) {
      addServerHandler({
        route: (rateLimiterConfig as MiddlewareConfiguration<RateLimiter>)
          .route,
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/rateLimiter')
        )
      })
    }

    // Register xssValidator middleware with default config that will return 400 Bad Request when either query or body will include unwanted characteds like <script>
    // Based on 'xss' package and works for both GET and POST requests
    const xssValidatorConfig = nuxt.options.security.xssValidator
    if (xssValidatorConfig) {
      addServerHandler({
        route: (xssValidatorConfig as MiddlewareConfiguration<XssValidator>)
          .route,
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/xssValidator')
        )
      })
    }

    // Register corsHandler middleware with default config that will add CORS setup
    const corsHandlerConfig = nuxt.options.security.corsHandler
    if (corsHandlerConfig) {
      addServerHandler({
        route: (corsHandlerConfig as MiddlewareConfiguration<H3CorsOptions>)
          .route,
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/corsHandler')
        )
      })
    }

    // Register allowedMethodsRestricter middleware with that will by default allow all methods
    const allowedMethodsRestricterConfig = nuxt.options.security
      .allowedMethodsRestricter as MiddlewareConfiguration<AllowedHTTPMethods>
    if (
      allowedMethodsRestricterConfig &&
      allowedMethodsRestricterConfig.value !== '*'
    ) {
      addServerHandler({
        route: allowedMethodsRestricterConfig.route,
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/allowedMethodsRestricter')
        )
      })
    }

    // Register basicAuth middleware that is disabled by default
    const basicAuthConfig = nuxt.options.security
      .basicAuth as MiddlewareConfiguration<BasicAuth>
    if (basicAuthConfig && basicAuthConfig?.value?.enabled) {
      addServerHandler({
        route: basicAuthConfig.route,
        handler: normalize(resolve(runtimeDir, 'server/middleware/basicAuth'))
      })
    }

    const csrfConfig = nuxt.options.security.csrf
    if (csrfConfig) {
      if (Object.keys(csrfConfig).length) {
        await installModule('nuxt-csurf', csrfConfig)
      }
      await installModule('nuxt-csurf')
    }
  }
})
