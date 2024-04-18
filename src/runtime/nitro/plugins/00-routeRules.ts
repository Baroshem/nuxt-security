import { defineNitroPlugin, useRuntimeConfig } from "#imports"
import { NuxtSecurityRouteRules } from "../../../types"
import { defuReplaceArray } from "../../../utils"
import { OptionKey, SecurityHeaders } from "../../../types/headers"
import { getKeyFromName, headerObjectFromString } from "../../utils/headers"

export default defineNitroPlugin((nitroApp) => {

  const config = useRuntimeConfig()
  const securityRouteRules: Record<string, NuxtSecurityRouteRules> = {}

  // First insert standard route rules headers
  for (const route in config.nitro.routeRules) {
    const rule = config.nitro.routeRules[route]
    const { headers } = rule
    const securityHeaders = standardToSecurity(headers)
    securityRouteRules[route] = { headers: securityHeaders }
  }


  // Then insert global security config
  const securityOptions = config.security
  securityRouteRules['/**'] = defuReplaceArray(
    securityOptions,
    securityRouteRules['/**']
  )
  
  // Then insert route specific security headers
  for (const route in config.nitro.routeRules) {
    const rule = config.nitro.routeRules[route]
    const { security } = rule
    if (security) {
      const { headers } = security
      let securityHeaders
      if (headers) {
        securityHeaders = backwardsCompatibleSecurity(headers)
      }
      securityRouteRules[route] = defuReplaceArray(
        { headers: securityHeaders },
        security,
        securityRouteRules[route],
      )
    }
  }

  // TO DO : DEPRECATE IN FAVOR OF NUXT-SECURITY:ROUTERULES HOOK
  nitroApp.hooks.hook('nuxt-security:headers', ({ route, headers }) => {
    securityRouteRules[route] = defuReplaceArray(
      { headers },
      securityRouteRules[route]
    )
  })
  nitroApp.hooks.callHook('nuxt-security:ready')

  // NEW HOOK HAS ABILITY TO CONFIGURE ALL SECURITY OPTIONS FOR EACH ROUTE
  nitroApp.hooks.callHook('nuxt-security:routeRules', securityRouteRules)


  nitroApp.hooks.hook('request', async(event) => {
    event.context.security = { routeRules: securityRouteRules }
  })
})

function standardToSecurity(standardHeaders?: Record<string, any>) {
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
          //standardHeaders[headerName] = headerStringFromObject(optionKey, headerValue)
        }
      }
    })
    return standardHeadersAsObject
  } else {
    return undefined
  }
}

function backwardsCompatibleSecurity(securityHeaders?: SecurityHeaders) {
    const securityHeadersAsObject: SecurityHeaders = {}

    if (securityHeaders) {
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
      return securityHeadersAsObject
    } else {
      return undefined
    }
}