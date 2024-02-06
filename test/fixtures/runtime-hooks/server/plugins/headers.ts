export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('nuxt-security:ready', () => {
        nitroApp.hooks.callHook('nuxt-security:headers', {
            route: '/api/runtime-hooks', headers: {
                contentSecurityPolicy: {
                    "script-src": ["'self'", "'unsafe-inline'", '*.azure.com'],
                }
            }
        })
        nitroApp.hooks.callHook('nuxt-security:headers', {
            route: '/', 
            headers: {
                contentSecurityPolicy: {
                    "script-src": ["'self'", "'unsafe-inline'", "some-value.com"],
                }
            }
        })
    })
})