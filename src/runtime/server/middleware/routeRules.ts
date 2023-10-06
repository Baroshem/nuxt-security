import { SECURITY_MIDDLEWARE_NAMES } from '../../../middlewares'
import { defineEventHandler, useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const nitroRouteRules = { ...config.nitro.routeRules }
  const securityOptions = config.security

  setSecurityRouteRules(nitroRouteRules, securityOptions)

  console.log(nitroRouteRules['/**'])
})

const setSecurityRouteRules = (nitroRouteRules: any, securityOptions: any) => {
  // const nitroRouteRules = nuxt.options.nitro.routeRules
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
