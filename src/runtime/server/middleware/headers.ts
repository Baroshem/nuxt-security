import { defineEventHandler, setHeaders } from '#imports'

export default defineEventHandler((event) => {
    if(event.context.security.headers) {  
       setHeaders(event, event.context.security.headers) 
    }
})