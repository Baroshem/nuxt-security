import { defineNitroPlugin, useRuntimeConfig } from "#imports"
import { getAppSecurityOptions } from '../context'
import { defuReplaceArray } from '../../../utils/merge'
import { standardToSecurity, backwardsCompatibleSecurity, appliesToAllResources } from '../../../utils/headers'
import type { SecurityHeaders, OptionKey } from '../../../types/headers'

/**
 * This plugin merges all security options into the global security context
 */
export default defineNitroPlugin(async(nitroApp) => {
  const appSecurityOptions = getAppSecurityOptions()
  const runtimeConfig = useRuntimeConfig()
  const headersMode = runtimeConfig.security.headersMode
  console.log('headersMode', headersMode)

  // First insert standard route rules headers
  for (const route in runtimeConfig.nitro.routeRules) {
    const rule = runtimeConfig.nitro.routeRules[route]
    const { headers } = rule
    const securityHeaders = standardToSecurity(headers)
    if (securityHeaders) {
      const applicableHeaders = applicableHeadersForMode(securityHeaders, headersMode)
      appSecurityOptions[route] = { headers: applicableHeaders }
    }
  }

  // Then insert global security config
  const securityOptions = runtimeConfig.security
  const { headers } = securityOptions

  const securityHeaders = backwardsCompatibleSecurity(headers)
  const applicableHeaders = applicableHeadersForMode(securityHeaders, headersMode)
  appSecurityOptions['/**'] = defuReplaceArray(
    { headers: applicableHeaders },
    securityOptions,
    appSecurityOptions['/**']
  )



  // Then insert route specific security headers
  for (const route in runtimeConfig.nitro.routeRules) {
    const rule = runtimeConfig.nitro.routeRules[route]
    const { security } = rule
    if (security) {
      const { headers } = security
      const securityHeaders = backwardsCompatibleSecurity(headers)
      const applicableHeaders = applicableHeadersForMode(securityHeaders, headersMode)
      appSecurityOptions[route] = defuReplaceArray(
        { headers: applicableHeaders },
        security,
        appSecurityOptions[route],
      )
    }
  }

  // TO DO : DEPRECATE IN FAVOR OF NUXT-SECURITY:ROUTERULES HOOK
  nitroApp.hooks.hook('nuxt-security:headers', ({ route, headers }) => {
    appSecurityOptions[route] = defuReplaceArray(
      { headers },
      appSecurityOptions[route]
    )
  })

  // NEW HOOK HAS ABILITY TO CONFIGURE ALL SECURITY OPTIONS FOR EACH ROUTE
  nitroApp.hooks.hook('nuxt-security:ready', async() => {
    await nitroApp.hooks.callHook('nuxt-security:routeRules', appSecurityOptions)
  })

  await nitroApp.hooks.callHook('nuxt-security:ready')
})

/**
 * In HTML-Only mode, all security headers are applied to HTML resources.
 * In All-Resources mode, only security headers that were not already applied to all resources are applied to HTML resources.
 */
function applicableHeadersForMode(headers: SecurityHeaders | undefined, headersMode: 'htmlOnly' | 'allResources') {
  if (!headers) {
    return undefined
  }
  if (headersMode === 'htmlOnly') {
    return headers
  } else {
    return <SecurityHeaders>Object.fromEntries(
      Object.entries(headers)
      .filter(([key]) => !appliesToAllResources(key as OptionKey))
    )
  }
}
