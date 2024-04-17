import { defineEventHandler, handleCors } from '#imports'
import type { H3CorsOptions } from 'h3'
import { resolveSecurityRules } from '../../composables/context'

export default defineEventHandler((event) => {
  const rules = resolveSecurityRules(event)

  if (rules?.corsHandler) {
    const { corsHandler } = rules
    handleCors(event, corsHandler as H3CorsOptions)
  }

})
