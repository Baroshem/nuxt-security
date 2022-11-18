import { defineEventHandler, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler((event) => {
  // let allowedMethods: string[];
  // if (Array.isArray(securityConfig.allowedMethodsRestricter.route) && securityConfig.allowedMethodsRestricter.value.route > 0) {
  //   const route = event.req.url
  //   const middlewareConfig = securityConfig.allowedMethodsRestricter.value.find((middleware, index) => securityConfig.allowedMethodsRestricter.route[index] === route)
  //   allowedMethods = middlewareConfig
  // } else {
  //   allowedMethods = securityConfig.allowedMethodsRestricter.value
  // }
  // if (!allowedMethods.includes(event.req.method!!)) {
  //   sendError(event, createError({ statusCode: 405, statusMessage: 'Method not allowed' }))
  // }
})
