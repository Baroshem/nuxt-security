import { defineEventHandler, handleCors } from '#imports'
import type { H3CorsOptions } from 'h3'
import { resolveSecurityRules } from '../../nitro/utils/context'

export default defineEventHandler(async(event) => {
  const rules = await resolveSecurityRules(event)

  if (rules?.corsHandler) {
    const { corsHandler } = rules
    handleCors(event, corsHandler as H3CorsOptions)
  }

})
