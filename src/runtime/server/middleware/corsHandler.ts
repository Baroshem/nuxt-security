import { defineEventHandler, handleCors } from 'h3'
// @ts-ignore
import { getRouteRules } from '#imports'

export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event)

  console.log('CORS', routeRules.security)

  // handleCors(event, routeRules.security.corsHandler)
})
