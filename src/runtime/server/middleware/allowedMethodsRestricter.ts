import { defineEventHandler, createError } from 'h3'
// @ts-ignore
import { getRouteRules } from '#imports'

export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event)
  const allowedMethodsRestricter = routeRules.security.allowedMethodsRestricter
  if (allowedMethodsRestricter) {
    const allowedMethods = allowedMethodsRestricter.methods
    if (!allowedMethods.includes(event.node.req.method!)) {
      const methodNotAllowedError = {
        statusCode: 405,
        statusMessage: 'Method not allowed'
      }

      if (allowedMethodsRestricter.throwError === false) {
        return methodNotAllowedError
      }
      throw createError(methodNotAllowedError)
    }
  }
})
