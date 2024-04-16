
export default defineEventHandler((event) => {
  const { headers } = event.context.security.rules
  return {
    csp: headers ? headers.contentSecurityPolicy : undefined
  }
})