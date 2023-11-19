export default  defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('nuxt-security:ready', () => {
        nitroApp.hooks.callHook('nuxt-security:headers', '/api/runtime-hooks' ,{
            contentSecurityPolicy: {
                "script-src": ["'self'", "'unsafe-inline'", '*.azure.com'],
            }
        })
    })
})