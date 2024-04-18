
export default defineEventHandler((event) => {
  const headers = {
    contentSecurityPolicy: {
      "script-src": ["'self'", '*.dynamic-value.com'],
    }
  }
  return { headers, nonce: true }
})