import { getNameFromKey, headerStringFromObject} from "../../utils/headers"
import { createRouter} from "radix3"
import { defineNitroPlugin } from '#imports'
import { OptionKey } from "~/src/module"

export default defineNitroPlugin((nitroApp) => {
    const router = createRouter()

    nitroApp.hooks.hook('nuxt-security:headers', (route, headersConfig) => {
        const headers: Record<string, string |false > = {}

        for (const [header, headerOptions] of Object.entries(headersConfig)) {
            const headerName = getNameFromKey(header as OptionKey) 
            if(headerName) {
                const value = headerStringFromObject(header as OptionKey, headerOptions)
                if(value) {
                    headers[headerName] = value
                } else {
                    delete headers[headerName]
                }
            }
        }

        router.insert(route, headers)
    })

    nitroApp.hooks.hook('request', (event) => {
        event.context.security = event.context.security || {}
        event.context.security.headers = router.lookup(event.path)
    })

    nitroApp.hooks.callHook('nuxt-security:ready')
})
