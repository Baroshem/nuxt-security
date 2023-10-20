import crypto from 'node:crypto'
import { createError, defineEventHandler, getCookie, sendError, setCookie } from 'h3'
// @ts-ignore
import { getRouteRules } from '#imports'

export type NonceOptions = {
  enabled: boolean;
  value: undefined | (() => string);
}

export default defineEventHandler((event) => {
  let csp = `${event.node.res.getHeader('Content-Security-Policy')}`
  const routeRules = getRouteRules(event)

  if (routeRules.security.nonce !== false) {
    const nonceConfig: NonceOptions = routeRules.security.nonce

    const nonce = nonceConfig?.value ? nonceConfig.value() : Buffer.from(crypto.randomUUID()).toString('base64')
    event.context.nonce = nonce

    // Set actual nonce value in CSP header
    csp = csp.replaceAll('{{nonce}}', nonce as string)
  } else {
    // Nonce is disabled, so make sure it's also not set in the csp header
    csp = csp.replaceAll('\'nonce-{{nonce}}\'', '')
  }

  event.node.res.setHeader('Content-Security-Policy', csp)
})
