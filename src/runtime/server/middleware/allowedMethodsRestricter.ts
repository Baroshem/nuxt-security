import { defineEventHandler, createError } from '#imports'
import { HTTPMethod } from '~/src/module'
import { resolveSecurityRules } from '../../nitro/utils'

export default defineEventHandler((event) => {
  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.allowedMethodsRestricter) {
    const { allowedMethodsRestricter } = rules

    const allowedMethods = allowedMethodsRestricter.methods

    if (allowedMethods !== '*' && !allowedMethods.includes(event.node.req.method! as HTTPMethod)) {
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
