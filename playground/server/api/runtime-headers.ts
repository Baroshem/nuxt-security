export default defineEventHandler(() => {
  const time = new Date().toISOString()
  return {
    // The (deprecated) headers hook can modify headers but not the other options
    headers: {
      contentSecurityPolicy: {
        'script-src': [time] 
        // Time is not a valid CSP value, but it's just an example to verify that it's set once and not re-evaluated
      }
    },
    hidePoweredBy: false // The new routeRules hook can modify any option. This will show the server name.
  }
})