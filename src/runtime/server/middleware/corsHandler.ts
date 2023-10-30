import { getRouteRules, defineEventHandler, handleCors } from '#imports'

export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event)
  handleCors(event, routeRules.security.corsHandler)
})
