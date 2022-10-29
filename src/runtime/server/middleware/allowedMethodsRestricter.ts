import { defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler((event) => {
  const allowedMethods: string[] = securityConfig.allowedMethodsRestricter.value
  if (!allowedMethods.includes(event.req.method!!)) {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
