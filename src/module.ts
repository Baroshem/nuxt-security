import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addServerHandler } from '@nuxt/kit'
import defu from 'defu'

export interface ModuleOptions {
  crossOriginResourcePolicy: string;
  crossOriginOpenerPolicy: string;
  crossOriginEmbedderPolicy: string;
  contentSecurityPolicy: string;
  originAgentCluster: string;
  referrerPolicy: string;
  strictTransportSecurity: string;
  xContentTypeOptions: string;
  xDNSPrefetchControl: string;
  xDownloadOptions: string;
  xFrameOptions: string;
  xPermittedCrossDomainPolicies: string;
  xXSSProtection: number;
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
    xXSSProtection: 0
  },
  setup (options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.runtimeConfig.helm = defu(nuxt.options.runtimeConfig.helm, {
      ...options
    })
    addServerHandler({ route: '', handler: resolve(runtimeDir, 'server/middleware/helm') })
  }
})
