import { getRouteRules, defineEventHandler, handleCors } from '#imports'
import type { H3CorsOptions } from 'h3'

export default defineEventHandler((event) => {
  const { security } = getRouteRules(event)

  if (security?.corsHandler) {
    const { corsHandler } = security
    handleCors(event, corsHandler as H3CorsOptions)
  }

})
