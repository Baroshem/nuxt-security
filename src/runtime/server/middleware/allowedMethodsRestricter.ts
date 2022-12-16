import { defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler((event) => {
  const allowedMethods: string[] = securityConfig.allowedMethodsRestricter.value
  if (!allowedMethods.includes(event.node.req.method!!)) {
    if (securityConfig.allowedMethodsRestricter.throwError) {
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
    } else {
      return { statusCode: 405, statusMessage: 'Method not allowed' }
    }
  }
})
