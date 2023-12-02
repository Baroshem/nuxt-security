import { defineEventHandler, handleCors } from 'h3'
// @ts-ignore
import { getRouteRules } from '#imports'

export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event)
  if (routeRules.security.corsHandler !== false) {
    handleCors(event, routeRules.security.corsHandler)
  }
})
