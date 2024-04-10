import { defineNuxtModule, addServerHandler, installModule, addVitePlugin, addServerPlugin, createResolver } from '@nuxt/kit'
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
import { headerObjectFromString, getKeyFromName, headerStringFromObject } from './runtime/utils/headers'
import { hashBundledAssets } from './runtime/utils/hashes'

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
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')
    nuxt.options.build.transpile.push(resolver.resolve('./runtime'))
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
    //setGlobalSecurityRoute(nuxt, securityOptions)
    //mergeSecurityPerRoute(nuxt)


/*
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/cspNonceHandler')
    })
 
    */

    if (nuxt.options.security.requestSizeLimiter) {
      addServerHandler({
        handler: resolver.resolve('./runtime/server/middleware/requestSizeLimiter')
      })
    }

    if (nuxt.options.security.rateLimiter) {
      registerStorageDriver(nuxt, securityOptions)
      addServerHandler({
        handler: resolver.resolve('./runtime/server/middleware/rateLimiter')
      })
    }

    if (nuxt.options.security.xssValidator) {
      // Remove potential duplicates
      nuxt.options.security.xssValidator.methods = Array.from(new Set(nuxt.options.security.xssValidator.methods))
      addServerHandler({
        handler: resolver.resolve('./runtime/server/middleware/xssValidator')
      })
    }

    if (nuxt.options.security.corsHandler) {
      addServerHandler({
        handler: resolver.resolve('./runtime/server/middleware/corsHandler')
      })
    }
    

    if(nuxt.options.security.runtimeHooks) {
      addServerPlugin(resolver.resolve('./runtime/nitro/plugins/00-context'))
    }

    if (securityOptions.hidePoweredBy) {
      nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
      nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []
      nuxt.options.nitro.externals.inline.push(runtimeDir)
      addServerPlugin(resolver.resolve('./runtime/nitro/plugins/01-hidePoweredBy'))
    }

    // Register nitro plugin to enable Security Headers
    // addServerPlugin(resolver.resolve('./runtime/nitro/plugins/02-securityHeaders'))

    // Pre-process HTML into DOM tree
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/02a-preprocessHtml'))

    // Register nitro plugin to enable Subresource Integrity
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/03-subresourceIntegrity'))

    // Register nitro plugin to enable CSP Hashes for SSG
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/04-cspSsgHashes'))

    // Register nitro plugin to enable CSP Headers presets for SSG
    // TEMPORARILY DISABLED AS NUXT 3.9.3 PREVENTS IMPORTING @NUXT/KIT IN NITRO PLUGINS
    /*
    addServerPlugin(resolve('./runtime/nitro/plugins/05-cspSsgPresets'))
    */

    // Nitro plugin to enable CSP Nonce for SSR
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/99-cspSsrNonce'))


    // Recombine HTML from DOM tree
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/99b-recombineHtml'))


    const allowedMethodsRestricterConfig = nuxt.options.security
    .allowedMethodsRestricter
    if (
      allowedMethodsRestricterConfig &&
      !Object.values(allowedMethodsRestricterConfig).includes('*')
    ) {
      addServerHandler({
        handler: resolver.resolve('./runtime/server/middleware/allowedMethodsRestricter')
      })
    }

    // Register basicAuth middleware that is disabled by default
    const basicAuthConfig = nuxt.options.runtimeConfig.private
      .basicAuth as unknown as BasicAuth
    if (basicAuthConfig && ((basicAuthConfig as any)?.enabled || (basicAuthConfig as any)?.value?.enabled)) {
      addServerHandler({
        route: (basicAuthConfig as any).route || '',
        handler: resolver.resolve('./runtime/server/middleware/basicAuth')
      })
    }
    
    // Calculates SRI hashes at build time
    nuxt.hook('nitro:build:before', hashBundledAssets)

    // Import composables
    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolver.resolve('./runtime/composables'))
    })

    // Import CSURF module
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
    { 
      '/**': { security: securityOptions }
    },
    nuxt.options.nitro.routeRules,
    /*{
      '/api/**' : { security: { headers: false } as { headers: false } },
      '/_nuxt/**' : { security : { headers: false } as { headers: false } }
    },*/
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
            standardHeaders[headerName] = headerStringFromObject(optionKey, headerValue)
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


function registerStorageDriver(nuxt: Nuxt, securityOptions: ModuleOptions) {
  nuxt.hook('nitro:config', (config) => {
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
  })

  // Make sure our nitro plugins will be applied last
  // After all other third-party modules that might have loaded their own nitro plugins
  nuxt.hook('nitro:init', nitro => {
    const resolver = createResolver(import.meta.url)
    const securityPluginsPrefix = resolver.resolve('./runtime/nitro/plugins')

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
