import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addServerHandler } from '@nuxt/kit'
import defu from 'defu'

export type RequestSizeLimiter = {
  maxRequestSizeInBytes: number;
  maxUploadFileRequestInBytes: number;
}

export interface ModuleOptions {
  crossOriginResourcePolicy: string | boolean;
  crossOriginOpenerPolicy: string | boolean;
  crossOriginEmbedderPolicy: string | boolean;
  contentSecurityPolicy: string | boolean;
  originAgentCluster: string | boolean;
  referrerPolicy: string | boolean;
  strictTransportSecurity: string | boolean;
  xContentTypeOptions: string | boolean;
  xDNSPrefetchControl: string | boolean;
  xDownloadOptions: string | boolean;
  xFrameOptions: string | boolean;
  xPermittedCrossDomainPolicies: string | boolean;
  xXSSProtection: number | boolean;
  requestSizeLimiter: RequestSizeLimiter | boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-helm',
    configKey: 'helm'
  },
  defaults: {
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
    requestSizeLimiter: {
      maxRequestSizeInBytes: 2000000,
      maxUploadFileRequestInBytes: 8000000
    }
  },
  setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.runtimeConfig.helm = defu(nuxt.options.runtimeConfig.helm, {
      ...options
    })

    // Register enabled middlewares that will return appriopriate security headers
    for (const header in nuxt.options.runtimeConfig.helm) {
      if (nuxt.options.runtimeConfig.helm[header]) {
        addServerHandler({ route: '', handler: resolve(runtimeDir, `server/middleware/${header}`) })
      }
    }

    if(nuxt.options.runtimeConfig.security.requestSizeLimiter) {
      addServerHandler({ route: '', handler: resolve(runtimeDir, 'server/middleware/requestSizeLimiter') })
    }
  }
})
