import { fileURLToPath } from 'node:url'
import { resolve, normalize } from 'pathe'
import { defineNuxtModule, addServerHandler, installModule, addVitePlugin } from '@nuxt/kit'
import { defu } from 'defu'
import type { Nuxt, RuntimeConfig } from '@nuxt/schema'
import viteRemove from 'unplugin-remove/vite'
import { defuReplaceArray } from './utils'
import type {
  ModuleOptions,
  NuxtSecurityRouteRules
} from './types/index'
import type {
  SecurityHeaders
} from './types/headers'
import type {
  BasicAuth
} from './types/middlewares'
import {
  defaultSecurityConfig
} from './defaultConfig'
import { SECURITY_MIDDLEWARE_NAMES } from './middlewares'
import { type HeaderMapper, SECURITY_HEADER_NAMES, getHeaderValueFromOptions } from './headers'

declare module 'nuxt/schema' {
  interface NuxtOptions {
    security: ModuleOptions
  }
  interface RuntimeConfig {
    security: ModuleOptions,
    private: { basicAuth: BasicAuth | false, [key: string]: any }
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

export * from './types/index'
export * from './types/headers'
export * from './types/middlewares'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-security',
    configKey: 'security'
  },
  async setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.security = defuReplaceArray(
      { ...options, ...nuxt.options.security },
      {
        ...defaultSecurityConfig(nuxt.options.devServer.url)
      }
    )
    const securityOptions = nuxt.options.security
    // Disabled module when `enabled` is set to `false`
    if (!securityOptions.enabled) { return }

    if (securityOptions.removeLoggers) {
      addVitePlugin(viteRemove(securityOptions.removeLoggers))
    }

    registerSecurityNitroPlugins(nuxt, securityOptions)

    nuxt.options.runtimeConfig.private = defu(
      nuxt.options.runtimeConfig.private,
      {
        basicAuth: securityOptions.basicAuth
      }
    )

    delete (securityOptions as any).basicAuth

    nuxt.options.runtimeConfig.security = defu(
      nuxt.options.runtimeConfig.security,
      {
        ...securityOptions
      }
    )

    if (securityOptions.headers) {
      setSecurityResponseHeaders(nuxt, securityOptions.headers)
    }

    setSecurityRouteRules(nuxt, securityOptions)

    // Remove Content-Security-Policy header in pre-rendered routes
    // When pre-rendered, the CSP is provided via html <meta> instead
    // If kept, this would block the site from rendering
    removeCspHeaderForPrerenderedRoutes(nuxt)

    if (nuxt.options.security.requestSizeLimiter) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/requestSizeLimiter')
        )
      })
    }

    if (nuxt.options.security.rateLimiter) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/rateLimiter')
        )
      })
    }

    if (nuxt.options.security.xssValidator) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/xssValidator')
        )
      })
    }

    if (nuxt.options.security.corsHandler) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/corsHandler')
        )
      })
    }
    if (nuxt.options.security.nonce) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, 'server/middleware/cspNonceHandler')
        )
      })
    }

    const allowedMethodsRestricterConfig = nuxt.options.security
      .allowedMethodsRestricter
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
    const basicAuthConfig = nuxt.options.runtimeConfig.private
      .basicAuth as unknown as BasicAuth
    if (basicAuthConfig && ((basicAuthConfig as any)?.enabled || (basicAuthConfig as any)?.value?.enabled)) {
      addServerHandler({
        route: (basicAuthConfig as any).route || '',
        handler: normalize(resolve(runtimeDir, 'server/middleware/basicAuth'))
      })
    }

    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(normalize(resolve(runtimeDir, 'composables')))
    })

    const csrfConfig = nuxt.options.security.csrf
    if (csrfConfig) {
      if (Object.keys(csrfConfig).length) {
        await installModule('nuxt-csurf', csrfConfig)
      }
      await installModule('nuxt-csurf')
    }
  }
})

const setSecurityResponseHeaders = (nuxt: Nuxt, headers: SecurityHeaders) => {
  for (const header in headers as SecurityHeaders) {
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

const removeCspHeaderForPrerenderedRoutes = (nuxt: Nuxt) => {
  const nitroRouteRules = nuxt.options.nitro.routeRules
  for (const route in nitroRouteRules) {
    const routeRules = nitroRouteRules[route]
    if (routeRules.prerender) {
      routeRules.headers = routeRules.headers || {}
      routeRules.headers['Content-Security-Policy'] = ''
    }
  }
}

const registerSecurityNitroPlugins = (
  nuxt: Nuxt,
  securityOptions: ModuleOptions
) => {
  nuxt.hook('nitro:config', (config) => {
    config.plugins = config.plugins || []

    if (securityOptions.rateLimiter) {
      // setup unstorage
      const driver = (securityOptions.rateLimiter).driver
      if (driver) {
        const { name, options } = driver
        config.storage = defu(
          config.storage,
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
      config.externals = config.externals || {}
      config.externals.inline = config.externals.inline || []
      config.externals.inline.push(
        normalize(fileURLToPath(new URL('./runtime', import.meta.url)))
      )
      config.plugins.push(
        normalize(
          fileURLToPath(
            new URL('./runtime/nitro/plugins/01-hidePoweredBy', import.meta.url)
          )
        )
      )
    }

    // Register nitro plugin to enable CSP for SSG
    if (
      typeof securityOptions.headers === 'object' &&
      securityOptions.headers.contentSecurityPolicy
    ) {
      config.plugins.push(
        normalize(
          fileURLToPath(
            new URL('./runtime/nitro/plugins/02-cspSsg', import.meta.url)
          )
        )
      )
    }

    // Nitro plugin to enable nonce for CSP
    if (nuxt.options.security.nonce) {
      config.plugins.push(
        normalize(
          fileURLToPath(
            new URL('./runtime/nitro/plugins/99-cspNonce', import.meta.url)
          )
        )
      )
    }
  })

  // Make sure our nitro plugins will be applied last
  // After all other third-party modules that might have loaded their own nitro plugins
  nuxt.hook('nitro:init', nitro => {
    const securityPluginsPrefix = normalize(
      fileURLToPath(
        new URL('./runtime/nitro/plugins', import.meta.url)
      )
    )
    nitro.options.plugins.sort((a, b) => {
      if (a.startsWith(securityPluginsPrefix)) {
        if (b.startsWith(securityPluginsPrefix)) {
          return 0
        } else {
          return 1
        }
      } else {
        if (b.startsWith(securityPluginsPrefix)) {
          return -1
        } else {
          return 0
        }
      }
    })
  })
}
