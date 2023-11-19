import { type HeaderMapper, getHeaderValueFromOptions, SECURITY_HEADER_NAMES } from "../../utils/headers"
import { createRouter} from "radix3"
import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin((nitroApp) => {
    const router = createRouter()

    nitroApp.hooks.hook('nuxt-security:headers', (route, headersConfig) => {
        const headers: Record<string, string> = {}

        for (const [header, headerOptions] of Object.entries(headersConfig)) {
            headers[SECURITY_HEADER_NAMES[header]] = getHeaderValueFromOptions(header as HeaderMapper, headerOptions as any)
        }

        router.insert(route, headers)
    })

    nitroApp.hooks.hook('request', (event) => {
        event.context.security = event.context.security || {}
        event.context.security.headers = router.lookup(event.path)
    })

    nitroApp.hooks.callHook('nuxt-security:ready')
})
