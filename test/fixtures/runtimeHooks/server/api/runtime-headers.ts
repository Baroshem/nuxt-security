
export default defineEventHandler(() => {
  const headers = {
    contentSecurityPolicy: {
      "script-src": ["'self'", '*.dynamic-value.com', "'nonce-{{nonce}}'"],
    }
  }
  return { headers, hidePoweredBy: false }
})