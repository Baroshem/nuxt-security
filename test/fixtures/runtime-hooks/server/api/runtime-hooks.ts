 
export default defineEventHandler((event) => {
    console.log('server api', event.path, event.context.security.rules.headers?.contentSecurityPolicy)
    return "runtime-hooks"
})