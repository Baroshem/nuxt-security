import { defineEventHandler, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler((event) => {
  let allowedMethods: string[];
  const isArrayPassedAsConfig = securityConfig.allowedMethodsRestricter['0']
  if (isArrayPassedAsConfig) {
    const route = event.node.req.url
    const arrayOfConfigs = Object.values(securityConfig.allowedMethodsRestricter) as any
    const foundConfig = arrayOfConfigs.find(config => config.route === route)
    if (foundConfig) {
      allowedMethods = foundConfig.value
    }
  } else {
    allowedMethods = securityConfig.allowedMethodsRestricter.value
  }

  if (allowedMethods?.length && !allowedMethods?.includes(event.node.req.method!!)) {
    return sendError(event, createError({ statusCode: 405, statusMessage: 'Method not allowed' }))
  }
})
