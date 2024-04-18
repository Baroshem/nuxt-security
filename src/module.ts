import { defineNuxtModule, addServerHandler, installModule, addVitePlugin, addServerPlugin, createResolver, addImportsDir } from '@nuxt/kit'
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
    security?: NuxtSecurityRouteRules;
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

    registerStorageDriver(nuxt, securityOptions)

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
    
    // Register nitro plugin to add security route rules to Nitro context
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/00-routeRules'))

    // Register nitro plugin to add nonce
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/10-nonce'))

    // Register nitro plugin to hide X-Powered-By header
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/20-hidePoweredBy'))

    // Register nitro plugin to enable Security Headers
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/30-securityHeaders'))

    // Pre-process HTML into DOM tree
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/40-preprocessHtml'))

    // Register nitro plugin to enable Subresource Integrity
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/50-subresourceIntegrity'))

    // Register nitro plugin to enable CSP Hashes for SSG
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/60-cspSsgHashes'))

    // Register nitro plugin to enable CSP Headers presets for SSG
    // TEMPORARILY DISABLED AS NUXT 3.9.3 PREVENTS IMPORTING @NUXT/KIT IN NITRO PLUGINS
    /*
    addServerPlugin(resolve('./runtime/nitro/plugins/70-cspSsgPresets'))
    */

    // Nitro plugin to enable CSP Nonce for SSR
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/80-cspSsrNonce'))

    // Recombine HTML from DOM tree
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/90-recombineHtml'))

    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/requestSizeLimiter')
    })

    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/corsHandler')
    })

    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/allowedMethodsRestricter')
    })

    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/rateLimiter')
    })

    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/xssValidator')
    })
    
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
    addImportsDir(resolver.resolve('./runtime/composables'))
    /*
    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolver.resolve('./runtime/composables'))
    })
    */

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
