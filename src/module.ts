import { fileURLToPath } from 'node:url'
import { resolve, normalize } from 'pathe'
import { defineNuxtModule, addServerHandler, installModule, addVitePlugin } from '@nuxt/kit'
import { defu } from 'defu'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions, NuxtSecurityRouteRules } from './types/index'
import type { SecurityHeaders } from './types/headers'
import { defaultSecurityConfig } from './defaultConfig'
import { SECURITY_MIDDLEWARE_NAMES } from './middlewares'
import { HeaderMapper, SECURITY_HEADER_NAMES, getHeaderValueFromOptions } from './headers'


declare module 'nuxt/schema' {
  interface RuntimeConfig {
    security: ModuleOptions
  }
}

declare module 'nitropack' {
  interface NitroRouteRules {
    security: NuxtSecurityRouteRules;
  }
  interface NitroRouteConfig {
    security: NuxtSecurityRouteRules;
  }
}

export default defineNuxtModule({
  meta: {
    name: 'nuxt-security',
    configKey: 'security'
  },
  defaults: (nuxt) => {
    return defaultSecurityConfig(nuxt.options.devServer.url)
  },
  async setup (securityOptions, nuxt) {
    if (!securityOptions.enabled) { return }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.runtimeConfig.security = securityOptions

    if (securityOptions.removeLoggers) {
      // ViteRemove does not come with a proper TS declaration
      const viteRemove = await import('unplugin-remove/vite') as unknown as (options: any) => any
      addVitePlugin(viteRemove(securityOptions.removeLoggers))
    }

    registerSecurityNitroPlugins(nuxt, securityOptions)

    if (securityOptions.headers) {
      setSecurityResponseHeaders(nuxt, securityOptions.headers)
    }

    setSecurityRouteRules(nuxt, securityOptions)

    if (securityOptions.requestSizeLimiter) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/requestSizeLimiter')
        )
      })
    }

    if (securityOptions.rateLimiter) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/rateLimiter')
        )
      })
    }

    if (securityOptions.xssValidator) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/xssValidator')
        )
      })
    }

    if (securityOptions.corsHandler) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/corsHandler')
        )
      })
    }

    if (securityOptions.nonce) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/cspNonceHandler')
        )
      })
    }

    const allowedMethodsRestricterConfig = securityOptions.allowedMethodsRestricter
    if (
      allowedMethodsRestricterConfig &&
      !Object.values(allowedMethodsRestricterConfig).includes('*')
    ) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/allowedMethodsRestricter')
        )
      })
    }

    // Register basicAuth middleware that is disabled by default
    const basicAuth = securityOptions.basicAuth
    if (basicAuth && basicAuth.enabled) {
      addServerHandler({
        route: '',
        handler: normalize(resolve(runtimeDir, 'server/middleware/basicAuth'))
      })
    }

    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(normalize(resolve(runtimeDir, 'composables')))
    })

    const csrfConfig = securityOptions.csrf
    if (csrfConfig) {
      if (Object.keys(csrfConfig).length) {
        await installModule('nuxt-csurf', csrfConfig)
      }
      await installModule('nuxt-csurf')
    }
  }
})

const setSecurityResponseHeaders = (nuxt: Nuxt, headers: SecurityHeaders) => {
  for (const header in headers) {
    if (headers[header as keyof typeof headers]) {
      const nitroRouteRules = nuxt.options.nitro.routeRules
      const headerOptions = headers[header as keyof typeof headers]
      const headerRoute = (headerOptions as any).route || '/**'
      nitroRouteRules![headerRoute] = {
        ...nitroRouteRules![headerRoute],
        headers: {
          ...nitroRouteRules![headerRoute]?.headers,
          [SECURITY_HEADER_NAMES[header]]: getHeaderValueFromOptions(header as HeaderMapper, headerOptions as any)
        }
      }
    }
  }
}

const setSecurityRouteRules = (nuxt: Nuxt, securityOptions: ModuleOptions) => {
  const nitroRouteRules = nuxt.options.nitro.routeRules
  const { headers, enabled, hidePoweredBy, ...rest } = securityOptions
  for (const middleware in rest) {
    const middlewareConfig = securityOptions[middleware as keyof typeof securityOptions] as any
    if (typeof middlewareConfig !== 'boolean') {
      const middlewareRoute = '/**'
      nitroRouteRules![middlewareRoute] = {
        ...nitroRouteRules![middlewareRoute],
        security: {
          ...nitroRouteRules![middlewareRoute]?.security,
          [SECURITY_MIDDLEWARE_NAMES[middleware]]: {
            ...middlewareConfig,
            throwError: middlewareConfig.throwError
          }
        }
      }
    }
  }
}

const registerSecurityNitroPlugins = (nuxt: Nuxt, securityOptions: ModuleOptions) => {
  nuxt.hook('nitro:config', (nitroConfig) => {
    nitroConfig.plugins = nitroConfig.plugins || []

    if (securityOptions.rateLimiter) {
      // setup unstorage
      const driver = (securityOptions.rateLimiter).driver
      if (driver) {
        const { name, options } = driver
        nitroConfig.storage = defu(
          nitroConfig.storage,
          {
            '#storage-driver': {
              driver: name,
              options
            }
          }
        )
      }
    }
        

    // Register nitro plugin to replace default 'X-Powered-By' header with custom one that does not indicate what is the framework underneath the app.
    if (securityOptions.hidePoweredBy) {
      nitroConfig.externals = nitroConfig.externals || {}
      nitroConfig.externals.inline = nitroConfig.externals.inline || []
      nitroConfig.externals.inline.push(
        normalize(fileURLToPath(new URL('./runtime', import.meta.url)))
      )
      nitroConfig.plugins.push(
        normalize(
          fileURLToPath(
            new URL('./runtime/nitro/plugins/01-hidePoweredBy', import.meta.url)
          )
        )
      )
    }

    // Register nitro plugin to enable CSP for SSG
    if (securityOptions.headers && securityOptions.headers.contentSecurityPolicy) {
      nitroConfig.plugins.push(
        normalize(
          fileURLToPath(
            new URL('./runtime/nitro/plugins/02-cspSsg', import.meta.url)
          )
        )
      )
    }

    // Nitro plugin to enable nonce for CSP
    if (securityOptions.nonce) {
      nitroConfig.plugins.push(
        normalize(
          fileURLToPath(
            new URL('./runtime/nitro/plugins/99-cspNonce', import.meta.url)
          )
        )
      )
    }
  })
}
