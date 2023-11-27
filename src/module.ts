import { fileURLToPath } from 'node:url'
import { resolve, normalize } from 'pathe'
import { defineNuxtModule, addServerHandler, installModule, addVitePlugin } from '@nuxt/kit'
import { defu } from 'defu'
import type { Nuxt } from '@nuxt/schema'
import viteRemove from 'unplugin-remove/vite'
import { defuReplaceArray } from './utils'
import type {
  ModuleOptions,
  NuxtSecurityRouteRules
} from './types/index'
import type {
OptionKey,
  SecurityHeaders,
} from './types/headers'
import type {
  BasicAuth
} from './types/middlewares'
import {
  defaultSecurityConfig
} from './defaultConfig'
import { headerObjectFromString, getKeyFromName } from './runtime/utils/headers'
import { bundledAssetsHashes } from './runtime/utils/hashes'

declare module '@nuxt/schema' {
  interface NuxtOptions {
    security: ModuleOptions
  }
  interface RuntimeConfig {
    security: ModuleOptions,
    private: { basicAuth: BasicAuth | false, [key: string]: any }
  }
}

declare module 'nitropack' {
  interface NitroRouteConfig {
    security?: Partial<NuxtSecurityRouteRules>;
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


    // PER ROUTE OPTIONS
    setGlobalSecurityRoute(nuxt, securityOptions)
    mergeSecurityPerRoute(nuxt)

    addServerHandler({
      handler: normalize(
        resolve(runtimeDir, 'server/middleware/cspNonceHandler')
      )
    })

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
    
    // Calculates SRI hashes at build time
    nuxt.hook('nitro:build:before', bundledAssetsHashes)


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

// Adds the global security options to all routes
function setGlobalSecurityRoute(nuxt: Nuxt, securityOptions: ModuleOptions) {
  nuxt.options.nitro.routeRules = defuReplaceArray(
    { '/**': { security: securityOptions }},
    nuxt.options.nitro.routeRules
  )
}

// Merges the standard headers into the security options
function mergeSecurityPerRoute(nuxt: Nuxt) {
  for (const route in nuxt.options.nitro.routeRules) {
    const rule = nuxt.options.nitro.routeRules[route]
    const { security, headers: standardHeaders } = rule

    // STEP 1 - DETECT STANDARD HEADERS THAT MAY OVERLAP WITH SECURITY HEADERS
    // Lookup standard radix headers
    // Detect if they belong to one of the SecurityHeaders
    // And convert them into object format
    const standardHeadersAsObject: SecurityHeaders = {}

    if (standardHeaders) {
      Object.entries(standardHeaders).forEach(([headerName, headerValue])  => {
        const optionKey = getKeyFromName(headerName)
        if (optionKey) {
          if (typeof headerValue === 'string') {
            // Normally, standard radix headers should be supplied as string
            const objectValue: any = headerObjectFromString(optionKey, headerValue)
            standardHeadersAsObject[optionKey] = objectValue
          } else {
            // Here we ensure backwards compatibility 
            // Because in the pre-rc1 syntax, standard headers could also be supplied in object format
            standardHeadersAsObject[optionKey] = headerValue
          }
        }
      })
    }

    // STEP 2 - ENSURE BACKWARDS COMPATIBILITY OF SECURITY HEADERS
    // Lookup the Security headers, normally they should be in object format
    // However detect if they were supplied in string format
    // And convert them into object format
    const securityHeadersAsObject: SecurityHeaders = {}

    if (security?.headers) {
      const { headers: securityHeaders } = security
      Object.entries(securityHeaders).forEach(([key, value]) => {
        const optionKey = key as OptionKey
        if ((optionKey === 'contentSecurityPolicy' || optionKey === 'permissionsPolicy' || optionKey === 'strictTransportSecurity') && (typeof value === 'string')) {
          // Altough this does not make sense in post-rc1 typescript definitions
          // It was possible before rc1 though, so let's ensure backwards compatibility here
          const objectValue: any = headerObjectFromString(optionKey, value)
          securityHeadersAsObject[optionKey] = objectValue
        } else if (value === '') {
          securityHeadersAsObject[optionKey] = false
        } else {
          securityHeadersAsObject[optionKey] = value
        }
      })
    }

    // STEP 3 - MERGE RESULT INTO SECURITY RULE
    // Security headers have priority
    const mergedHeadersAsObject = defuReplaceArray(
      securityHeadersAsObject,
      standardHeadersAsObject
    )
    if (Object.keys(mergedHeadersAsObject).length) {
      nuxt.options.nitro.routeRules[route] = defuReplaceArray(
        { security: {
            headers: mergedHeadersAsObject
          }
        },
        rule
      )
    }
  }
}


function registerSecurityNitroPlugins(nuxt: Nuxt, securityOptions: ModuleOptions) {
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

    // Register nitro plugin to enable Security Headers
    config.plugins.push(
      normalize(
        fileURLToPath(
          new URL('./runtime/nitro/plugins/02-securityHeaders', import.meta.url)
        )
      )
    )

    // Register nitro plugin to enable Subresource Integrity
    config.plugins.push(
      normalize(
        fileURLToPath(
          new URL('./runtime/nitro/plugins/03-subresourceIntegrity', import.meta.url)
        )
      )
    )

    // Register nitro plugin to enable CSP Hashes for SSG
    config.plugins.push(
      normalize(
        fileURLToPath(
          new URL('./runtime/nitro/plugins/04-cspSsgHashes', import.meta.url)
        )
      )
    )

    // Register nitro plugin to enable CSP Headers presets for SSG
    config.plugins.push(
      normalize(
        fileURLToPath(
          new URL('./runtime/nitro/plugins/05-cspSsgPresets', import.meta.url)
        )
      )
    )

    // Nitro plugin to enable CSP Nonce for SSR
    config.plugins.push(
      normalize(
        fileURLToPath(
          new URL('./runtime/nitro/plugins/99-cspSsrNonce', import.meta.url)
        )
      )
    )
  })

  // Make sure our nitro plugins will be applied last
  // After all other third-party modules that might have loaded their own nitro plugins
  nuxt.hook('nitro:init', nitro => {
    const securityPluginsPrefix = normalize(
      fileURLToPath(
        new URL('./runtime/nitro/plugins', import.meta.url)
      )
    )
    // SSR: Reorder plugins in Nitro options
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
    // SSG: Reorder plugins in Nitro hook
    nitro.hooks.hook('prerender:config', config => {
      config.plugins?.sort((a, b) => {
        if (a?.startsWith(securityPluginsPrefix)) {
          if (b?.startsWith(securityPluginsPrefix)) {
            return 0
          } else {
            return 1
          }
        } else {
          if (b?.startsWith(securityPluginsPrefix)) {
            return -1
          } else {
            return 0
          }
        }
      })
    })
  })
}
