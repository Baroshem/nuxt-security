import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import type { NitroRouteRules } from 'nitropack'
import { defu } from 'defu'
import { withoutBase } from 'ufo'
import type { ModuleOptions } from '../../../types'
import type { SecurityHeaders } from '../../../types/headers.ts'
import { SECURITY_MIDDLEWARE_NAMES } from '../../../middlewares'
import { HeaderMapper, SECURITY_HEADER_NAMES, getHeaderValueFromOptions } from '../../../headers'
import { defineNitroPlugin, useRuntimeConfig } from '#imports'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const nitroRouteRules = { ...config.nitro.routeRules }
  const securityOptions = config.security

  const setSecurityRouteRules = (nitroRouteRules: NitroRouteRules, securityOptions: ModuleOptions) => {
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

  const setSecurityResponseHeaders = (nitroRouteRules: NitroRouteRules, headers: SecurityHeaders) => {
    for (const header in headers as SecurityHeaders) {
      if (headers[header as keyof typeof headers]) {
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

  if (securityOptions.headers) {
    setSecurityResponseHeaders(nitroRouteRules, securityOptions.headers)
  }

  setSecurityRouteRules(nitroRouteRules, securityOptions)

  // https://github.com/unjs/nitro/blob/ae253596a847f764e275f7e0450ffdfcdcd8957e/src/runtime/route-rules.ts#L15
  const _routeRulesMatcher = toRouteMatcher(
    createRadixRouter({ routes: nitroRouteRules })
  )

  function getRouteRulesForPath (path: string): NitroRouteRules {
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse())
  }

  nitroApp.hooks.hook('request', (event) => {
    event.context._nitro ||= {}
    event.context._nitro.routeRules ||= {}
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split('?')[0], config.app.baseURL)
    )
  })
})
