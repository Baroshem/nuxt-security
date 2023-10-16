import { defineEventHandler, handleCors, getRouteRules } from '#imports'

export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event)
  const { corsHandler } = routeRules.security
  if (!corsHandler) {
    return
  }
  handleCors(event, corsHandler)
})
