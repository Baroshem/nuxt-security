import { getRouteRules, defineEventHandler, handleCors } from '#imports'
import type { H3CorsOptions } from 'h3'

export default defineEventHandler((event) => {
  const { rules } = event.context.security

  if (rules?.corsHandler) {
    const { corsHandler } = rules
    handleCors(event, corsHandler as H3CorsOptions)
  }

})
