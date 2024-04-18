
export default defineEventHandler(() => {
  const headers = {
    contentSecurityPolicy: {
      "script-src": ["'self'", '*.dynamic-value.com'],
    }
  }
  return { headers, nonce: true }
})