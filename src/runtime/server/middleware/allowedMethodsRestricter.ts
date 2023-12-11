import { getRouteRules, defineEventHandler, createError } from '#imports'

export default defineEventHandler((event) => {
  const { security } = getRouteRules(event)

  if (security?.allowedMethodsRestricter) {
  const { allowedMethodsRestricter } = security

    const allowedMethods = allowedMethodsRestricter.methods
    if (allowedMethods !== '*' && !allowedMethods.includes(event.node.req.method!)) {
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
