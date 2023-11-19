import { defineEventHandler, setHeader, removeResponseHeader } from '#imports'

export default defineEventHandler((event) => {
    if(event.context.security.headers) {  
        Object.entries(event.context.security.headers).forEach(([header, value]) => {
            if(value === false) {
                removeResponseHeader(event, header)
            }else {
                setHeader(event, header, value, )
            }
        }) 
    }
})