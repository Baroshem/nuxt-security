import { defineEventHandler, handleCors } from 'h3'
import type { H3CorsOptions } from 'h3'
import { resolveSecurityRules } from '../../nitro/context'

export default defineEventHandler((event) => {
  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.corsHandler) {
    const { corsHandler } = rules

    let origin: H3CorsOptions['origin']
    if (typeof corsHandler.origin === 'string' && corsHandler.origin !== '*') {
      origin = [corsHandler.origin]
    } else {
      origin = corsHandler.origin
    }

    if (origin && origin !== '*' && corsHandler.useRegExp) {
      origin = origin.map((o) => new RegExp(o, 'i'))
    }

    handleCors(event, {
      origin,
      methods: corsHandler.methods,
      allowHeaders: corsHandler.allowHeaders,
      exposeHeaders: corsHandler.exposeHeaders,
      credentials: corsHandler.credentials,
      maxAge: corsHandler.maxAge,
      preflight: corsHandler.preflight
    })
  }

})
