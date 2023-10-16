import { defineEventHandler, handleCors } from 'h3'
import { getRouteRules } from '#imports'

export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event)
  const { corsHandler } = routeRules.security
  if (!corsHandler) {
    return
  }
  handleCors(event, corsHandler)
})
