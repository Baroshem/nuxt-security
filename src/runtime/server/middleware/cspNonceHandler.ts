import crypto from 'node:crypto'
import { getRouteRules, defineEventHandler } from '#imports'

export default defineEventHandler((event) => {
  let csp = `${event.node.res.getHeader('Content-Security-Policy')}`
  const routeRules = getRouteRules(event)

  if (routeRules.security.nonce !== false) {
    const nonce = crypto.randomBytes(16).toString('base64')
    event.context.nonce = nonce

    // Set actual nonce value in CSP header
    csp = csp.replaceAll('{{nonce}}', nonce as string)
  } else {
    // Nonce is disabled, so make sure it's also not set in the csp header
    csp = csp.replaceAll('\'nonce-{{nonce}}\'', '')
  }

  event.node.res.setHeader('Content-Security-Policy', csp)
})
