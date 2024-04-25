import { defineEventHandler, handleCors } from '#imports'
import type { H3CorsOptions } from 'h3'
import { resolveSecurityRules } from '../../nitro/context'

export default defineEventHandler((event) => {
  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.corsHandler) {
    const { corsHandler } = rules
    handleCors(event, corsHandler as H3CorsOptions)
  }

})
