
export default defineEventHandler((event) => {
  const headers = {
    contentSecurityPolicy: {
      "script-src": ["'self'", "'unsafe-inline'", '*.dynamic-value.com'],
    }
  }
  return { headers }
})