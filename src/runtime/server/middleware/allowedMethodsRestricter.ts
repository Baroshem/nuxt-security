import { defineEventHandler, createError } from '#nuxt-security/server'
import { resolveSecurityRules } from '../../nitro/context'
import type { HTTPMethod } from '../../../types/middlewares'

export default defineEventHandler((event) => {
  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.allowedMethodsRestricter) {
    const { allowedMethodsRestricter } = rules

    const allowedMethods = allowedMethodsRestricter.methods

    if (allowedMethods !== '*' && !allowedMethods.includes(event.method as HTTPMethod)) {
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
