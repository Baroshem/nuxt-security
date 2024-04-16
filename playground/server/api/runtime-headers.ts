import { defineEventHandler } from "#imports"

export default defineEventHandler((event) => {
  const time = new Date().toISOString()
  return {
    headers: {
      contentSecurityPolicy: {
        'script-src': ["'self'", "'unsafe-inline'", "'nonce-{{nonce}}'", time] 
        // Time is not a valid CSP value, but it's just an example to verify that it's set once and not re-evaluated
        // Nonce is provided in valid placeholder format, and it's set to be replaced with the proper nonce value
      },
    }
  }
})