import { defineNitroPlugin, useRuntimeConfig } from "nitropack/runtime"
import { getAppSecurityOptions } from '../context'
import { defuReplaceArray } from '../../../utils/merge'
import { standardToSecurity, backwardsCompatibleSecurity } from '../../../utils/headers'

/**
 * This plugin merges all security options into the global security context
 */
export default defineNitroPlugin(async(nitroApp) => {
  const appSecurityOptions = getAppSecurityOptions()
  const runtimeConfig = useRuntimeConfig()

  // First insert standard route rules headers
  for (const route in runtimeConfig.nitro.routeRules) {
    const rule = runtimeConfig.nitro.routeRules[route]
    if (!rule) continue
    const { headers } = rule
    const securityHeaders = standardToSecurity(headers)
    if (securityHeaders) {
      appSecurityOptions[route] = { headers: securityHeaders }
    }
  }

  // Then insert global security config
  const securityOptions = runtimeConfig.security
  const { headers } = securityOptions

  const securityHeaders = backwardsCompatibleSecurity(headers)
  appSecurityOptions['/**'] = defuReplaceArray(
    { headers: securityHeaders },
    securityOptions,
    appSecurityOptions['/**']
  )



  // Then insert route specific security headers
  for (const route in runtimeConfig.nitro.routeRules) {
    const rule = runtimeConfig.nitro.routeRules[route]
    if (!rule) continue
    const { security } = rule
    if (security) {
      const { headers } = security
      const securityHeaders = backwardsCompatibleSecurity(headers)
      appSecurityOptions[route] = defuReplaceArray(
        { headers: securityHeaders },
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
