import { getNameFromKey, headerStringFromObject} from "../../utils/headers"
import { createRouter} from "radix3"
import { defineNitroPlugin, setHeader, removeResponseHeader} from "#imports"
import { OptionKey } from "~/src/module"

export default defineNitroPlugin((nitroApp) => {
    const router = createRouter<Record<string, string | false>>()

    nitroApp.hooks.hook('nuxt-security:headers', ({route, headers: headersConfig}) => {
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
        const routeSecurity = router.lookup(event.path) as Record<string, string |false>
        if(routeSecurity) {
            event.context.security.headers = routeSecurity
        }
    })

    nitroApp.hooks.hook('beforeResponse', (event) => {
        if(event.context.security.headers) {  
            Object.entries(event.context.security.headers).forEach(([header, value]) => {
                if (value === false) {
                    removeResponseHeader(event, header)
                } else {
                    setHeader(event, header, value)
                }
            })
        }
    })

    nitroApp.hooks.callHook('nuxt-security:ready')
})
