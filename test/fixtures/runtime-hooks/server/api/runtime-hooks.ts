import { getResponseHeader } from "h3"
 
export default defineEventHandler((event) => {
    return {
        csp: getResponseHeader(event, 'Content-Security-Policy')
    }
})