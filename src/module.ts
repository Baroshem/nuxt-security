import { resolve, normalize } from 'pathe'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addServerHandler } from '@nuxt/kit'
import defu from 'defu'
import { AllowedHTTPMethods, BasicAuth, MiddlewareConfiguration, ModuleOptions, RateLimiter, RequestSizeLimiter, SecurityHeader, SecurityHeaders, XssValidator } from './types'
import { defaultSecurityConfig } from './defaultConfig'
import { SECURITY_HEADER_NAMES } from './headers'
import { Nuxt, RuntimeConfig } from '@nuxt/schema'
import { CorsOptions } from '@nozomuikuta/h3-cors'

declare module '@nuxt/schema' {
  interface NuxtOptions {
    security: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-security',
    configKey: 'security'
  },
  defaults: defaultSecurityConfig,
  setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.security = defu(nuxt.options.security, {
      ...options
    })
    nuxt.options.runtimeConfig.security = defu(nuxt.options.runtimeConfig.security, {
      ...nuxt.options.security as RuntimeConfig['security']
    })

    // Workaround for defu merging default config and user config with different structure
    // if user passed an array instead of single value, delete default config values
    deleteDefaultValuesFromConfig(nuxt)

    // Register nitro plugin to hide default 'X-Powered-By' header
    setHidePoweredByMiddleware(nuxt)

    // Register enabled middlewares to automatically set default values for security response headers.
    setSecurityHeaders(nuxt)

    // Register requestSizeLimiter middleware with default values that will throw an error when the payload will be too big for methods like POST/PUT/DELETE.
    setRequestSizeLimiterMiddleware(nuxt, runtimeDir)

    // Register rateLimiter middleware with default values that will throw an error when there will be too many requests from the same IP during certain interval.
    // Based on 'limiter' package and stored in 'unstorage' for each ip address.
    setRateLimiterMiddleware(nuxt, runtimeDir)

    // Register xssValidator middleware with default config that will return 400 Bad Request when either query or body will include unwanted characteds like <script>
    // Based on 'xss' package and works for both GET and POST requests
    setXssValidatorMiddleware(nuxt, runtimeDir)

    // Register corsHandler middleware with default config that will add CORS setup
    // Based on '@nozomuikuta/h3-cors' package
    setCorsHandlerMiddleware(nuxt, runtimeDir)

    // Register allowedMethodsRestricter middleware with that will by default allow all methods
    setAllowedMethodsRestricterMiddleware(nuxt, runtimeDir)

    // Register basicAuth middleware that is disabled by default
    setBasicAuthMiddleware(nuxt, runtimeDir)
  }
})


const deleteDefaultValuesFromConfig = (nuxt: Nuxt) => {
  for(let config in nuxt.options.security) {
    if (config === 'headers') {
      for (let headerConfig in nuxt.options.security.headers as SecurityHeaders) {
        const securitHeaderConfig = (nuxt.options.security.headers as any)[headerConfig]
        const isArrayPassed = securitHeaderConfig['']
        if (isArrayPassed) {
          delete securitHeaderConfig.value
          delete securitHeaderConfig.route
        }
      }
    } else {
      const middlewareConfig = (nuxt.options.security as any)[config]
      const isArrayPassedAsConfig = middlewareConfig['0']
      if (isArrayPassedAsConfig) {
        delete middlewareConfig.value
        delete middlewareConfig.route
      }
    }
  }
}

const setHidePoweredByMiddleware = (nuxt: Nuxt) => {
  if (nuxt.options.security.hidePoweredBy) {
    nuxt.hook('nitro:config', (config) => {
      config.plugins = config.plugins || []
      config.plugins.push(normalize(fileURLToPath(new URL('./runtime/nitro', import.meta.url))))
    })
  }
}

const setAllowedMethodsRestricterMiddleware = (nuxt: Nuxt, runtimeDir: string) => {
  const allowedMethodsRestricterConfig = nuxt.options.security.allowedMethodsRestricter as MiddlewareConfiguration<AllowedHTTPMethods>
  if (allowedMethodsRestricterConfig) {
    if ((allowedMethodsRestricterConfig as any)['0']) {
      const config = Object.values(allowedMethodsRestricterConfig)
      config.forEach(middleware => {
        addServerHandler({ route: middleware.route, handler: normalize(resolve(runtimeDir, 'server/middleware/allowedMethodsRestricter')) })
      })
    } else {
      if ((allowedMethodsRestricterConfig as any)?.value !== '*') {
        addServerHandler({ route: (allowedMethodsRestricterConfig as any).route, handler: normalize(resolve(runtimeDir, 'server/middleware/allowedMethodsRestricter')) })
      }
    }
  }
}

const setBasicAuthMiddleware = (nuxt: Nuxt, runtimeDir: string) => {
  const basicAuthConfig = nuxt.options.security.basicAuth as { route: string, value: BasicAuth }
  if (basicAuthConfig && basicAuthConfig?.value?.enabled) {
    addServerHandler({ route: basicAuthConfig.route, handler: normalize(resolve(runtimeDir, 'server/middleware/basicAuth')) })
  }
}

const setCorsHandlerMiddleware = (nuxt: Nuxt, runtimeDir: string) => {
  const corsHandlerConfig = nuxt.options.security.corsHandler
  if (corsHandlerConfig) {
    addServerHandler({ route: (corsHandlerConfig as MiddlewareConfiguration<CorsOptions>).route, handler: normalize(resolve(runtimeDir, 'server/middleware/corsHandler')) })
  }
}

const setXssValidatorMiddleware = (nuxt: Nuxt, runtimeDir: string) => {
  const xssValidatorConfig = nuxt.options.security.xssValidator
  if (xssValidatorConfig) {
    addServerHandler({ route: (xssValidatorConfig as MiddlewareConfiguration<XssValidator>).route, handler: normalize(resolve(runtimeDir, 'server/middleware/xssValidator')) })
  }
}

const setRateLimiterMiddleware = (nuxt: Nuxt, runtimeDir: string) => {
  const rateLimiterConfig = nuxt.options.security.rateLimiter
  if (rateLimiterConfig) {
    addServerHandler({ route: (rateLimiterConfig as MiddlewareConfiguration<RateLimiter>).route, handler: normalize(resolve(runtimeDir, 'server/middleware/rateLimiter')) })
  }
}

const setRequestSizeLimiterMiddleware = (nuxt: Nuxt, runtimeDir: string) => {
  const requestSizeLimiterConfig = nuxt.options.security.requestSizeLimiter
  if(requestSizeLimiterConfig) {
    addServerHandler({ route: (requestSizeLimiterConfig as MiddlewareConfiguration<RequestSizeLimiter>).route, handler: normalize(resolve(runtimeDir, 'server/middleware/requestSizeLimiter')) })
  }
}

const setSecurityHeaders = (nuxt: Nuxt) => {
  if (nuxt.options.security.headers) {
    for (const header in nuxt.options.security.headers as SecurityHeaders) {
      if ((nuxt.options.security.headers as SecurityHeader)[header]) {
        // Have to create this manually, otherwise the build will fail. Also, have to create empty object first or use the previous headers if they are for the same route
        nuxt.options.nitro.routeRules!![(nuxt.options.security.headers as SecurityHeader)[header].route] = { headers: nuxt.options.nitro.routeRules!![(nuxt.options.security.headers as SecurityHeader)[header].route] ? { ...nuxt.options.nitro.routeRules!![(nuxt.options.security.headers as SecurityHeader)[header].route].headers } : {} }

        nuxt.options.nitro.routeRules!![(nuxt.options.security.headers as SecurityHeader)[header].route].headers!![SECURITY_HEADER_NAMES[header]] = (nuxt.options.security.headers as SecurityHeader)[header].value
      }
    }
  }
}
