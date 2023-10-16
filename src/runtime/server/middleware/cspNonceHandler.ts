import crypto from 'node:crypto'
import { createError, defineEventHandler, getCookie, sendError, setCookie, getRouteRules } from '#imports'

export default defineEventHandler((event) => {
  let csp = `${event.node.res.getHeader('Content-Security-Policy')}`
  const routeRules = getRouteRules(event)
  const nonceConfig = routeRules.security.nonce

  if (nonceConfig !== false) {

    // See if we are checking the nonce against the current value, or if we are renewing the nonce value
    let nonce: string | undefined
    switch (nonceConfig?.mode) {
      case 'check': {
        nonce = event.context.nonce ?? getCookie(event, 'nonce')

        if (!nonce) {
          return sendError(event, createError({ statusCode: 401, statusMessage: 'Nonce is not set' }))
        }

        break
      }
      case 'renew':
      default: {
        nonce = nonceConfig?.value ? nonceConfig?.value() : Buffer.from(crypto.randomUUID()).toString('base64')
        setCookie(event, 'nonce', nonce, { sameSite: true, secure: true })
        event.context.nonce = nonce
        break
      }
    }

    // Set actual nonce value in CSP header
    csp = csp.replaceAll('{{nonce}}', nonce)
  } else {
    // Nonce is disabled, so make sure it's also not set in the csp header
    csp = csp.replaceAll('\'nonce-{{nonce}}\'', '')
  }

  event.node.res.setHeader('Content-Security-Policy', csp)
})
