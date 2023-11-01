import { getRouteRules, defineEventHandler, createError } from '#imports'

export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event)
  const allowedMethodsRestricter = routeRules.security.allowedMethodsRestricter
  if (allowedMethodsRestricter !== false) {
    const allowedMethods: string[] = allowedMethodsRestricter.methods
    if (!allowedMethods.includes(event.node.req.method!)) {
      const methodNotAllowedError = {
        statusCode: 405,
        statusMessage: 'Method not allowed'
      }

      if (routeRules.security.allowedMethodsRestricter.throwError === false) {
        return methodNotAllowedError
      }
      throw createError(methodNotAllowedError)
    }
  }
})
